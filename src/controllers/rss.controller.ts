import { NextFunction, Request, Response } from 'express';
import { MinioService } from 'services/minio.service'
import RSS from 'rss'
import xml2json from 'xml2json'

class RssController {
  public index = (req: Request, res: Response, next: NextFunction): void => {
    let feed = new RSS({
        title: "Creative Cast",
        feed_url: "https://thestoryboardrss.newlinkedlist.com/rss",
        site_url: "https://thestoryboard.newlinkedlist.com",
        image_url: 'http://example.com/icon.png',
        managingEditor: 'Jen Clark-Hall',
        webMaster: 'Richard Jackson ',
        copyright: '2021 Jen Clark-Hall',
        language: 'en',
        categories: ['Creative','Media', 'North East', 'UK'],
        pubDate: 'July 1, 2021 00:00:00 GMT',
        ttl: 60
    })

    MinioService.getMinioFolderDetails('https://minio.newlinkedlist.com/thestoryboard/')
    .then( (response) => {

      let json = JSON.parse(xml2json.toJson(response.data))

      for(let content of json.ListBucketResult.Contents){
        feed.item({
          title:  'Paul Greveson',
          description: 'In this episode we chat with Paul Greveson about his role as a Lead Technical Artist at Embark Studios. Listen on to find out more about what it\'s like to work in the gaming industry.',
          url: `https://minio.newlinkedlist.com/thestoryboard/${content.Key}`, // link to the item
          categories: ['Creative','Media', 'North East', 'UK', 'Video games'],
          date: 'July 16 2021', // any format that js Date can parse.
          enclosure: {url: `https://minio.newlinkedlist.com/thestoryboard/${content.Key}`, size: content.Size, type: "audio/mpeg"}
        });
      }
      
      // cache the xml to send to clients
      var xmlFeed = feed.xml();

      try {
        res.type('application/xml');
        res.send(xmlFeed)
      } catch (error) {
        next(error);
      }
    })
  };
}

export default RssController;
