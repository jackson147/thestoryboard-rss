import { NextFunction, Request, Response } from 'express';
import RSS from 'rss'
import xml2json from 'xml2json'
import axios from 'axios'

class RssController {

  public index = (req: Request, res: Response, next: NextFunction): void => {

    let icon = 'https://scontent.flba3-1.fna.fbcdn.net/v/t1.6435-9/87263194_100928184846134_6604263639308304384_n.jpg?_nc_cat=103&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=W29kRo_zr7kAX-2JNqk&_nc_ht=scontent.flba3-1.fna&oh=a5006e87da1c788d800e4f85ae1c467d&oe=613E877F'

    let feed = new RSS({
        title: "Creative Cast",
        feed_url: "https://thestoryboardrss.newlinkedlist.com/rss",
        site_url: "https://www.facebook.com/thestoryboardhub/",
        image_url: icon,
        managingEditor: 'Jen Clark-Hall',
        webMaster: 'Richard Jackson ',
        copyright: '2021 Jen Clark-Hall',
        language: 'en',
        categories: ['Creative','Media', 'North East', 'UK'],
        pubDate: 'July 1, 2021 00:00:00 GMT',
        ttl: 60,
        custom_elements: [
          {'itunes:subtitle': 'Interviewing creative individuals from the North East of the UK'},
          {'itunes:author': 'Jen Clark-Hall'},
          {'itunes:summary': 'We chat with creative individuals and businesses about how they have carved a path in the creative industries. From Digital Artists and  Architects to Potters and Production Assistants... and everything in between!'},
          {'itunes:owner': [
            {'itunes:name': 'Jen Clark-Hall'},
            {'itunes:email': 'jen.pen.clark@gmail.com'}
          ]},
          {'itunes:image': {
            _attr: {
              href: icon
            }
          }},
          {'itunes:category': [
            {_attr: {
              text: 'Technology'
            }},
            {'itunes:category': {
              _attr: {
                text: 'Gadgets'
              }
            }}
          ]}
        ]
    })

    axios.get('https://minio.newlinkedlist.com/thestoryboard/')
    .then( (response) => {

      let json = JSON.parse(xml2json.toJson(response.data))

      for(let content of json.ListBucketResult.Contents){
        feed.item({
          title:  'Paul Greveson',
          description: 'In this episode we chat with Paul Greveson about his role as a Lead Technical Artist at Embark Studios. Listen on to find out more about what it\'s like to work in the gaming industry.',
          url: `https://www.facebook.com/thestoryboardhub/`, // link to the item
          categories: ['Creative','Media', 'North East', 'UK', 'Video games'],
          date: 'July 16 2021', // any format that js Date can parse.
          enclosure: {
            url: `https://minio.newlinkedlist.com/thestoryboard/${content.Key}`,
            size: content.Size, type: "audio/mpeg"
          }
        });
      }

      // feed.item({
      //   title:  'Paul Greveson',
      //   description: 'In this episode we chat with Paul Greveson about his role as a Lead Technical Artist at Embark Studios. Listen on to find out more about what it\'s like to work in the gaming industry.',
      //   url: `https://minio.newlinkedlist.com/thestoryboard/01.mp3`, // link to the item
      //   categories: ['Creative','Media', 'North East', 'UK', 'Video games'],
      //   date: 'July 16 2021', // any format that js Date can parse.
      //   enclosure: {url: `https://minio.newlinkedlist.com/thestoryboard/01.mp3`, size: 0, type: "audio/mpeg"}
      // });
      
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
