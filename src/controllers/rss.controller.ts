import { NextFunction, Request, Response } from 'express';
import RSS from 'rss'
import minioService from '@services/minio.service'
import { ShowsService } from '@services/shows.service'
import NodeCache from 'node-cache';

class RssController {

  public minioService = new minioService()
  private showsService = new ShowsService()

  private cache: NodeCache = new NodeCache()

  public index = async(req: Request, res: Response, next: NextFunction): Promise<void> => {

    let feed: any = this.cache.get('feed')
    //Create feed if it's not in the cache
    if(!feed){
      feed = this.createFeed();
      let shows = await this.showsService.getShows()
      feed = await this.addShows(feed, shows)

      // cache the xml to send to clients
      let xmlFeed = feed.xml();
      this.cache.set('feed', xmlFeed, 1800)//30mins
    }

    try {
      res.type('application/xml');
      res.send(this.cache.get('feed'))
    } catch (error) {
      next(error);
    }
  };

  private createFeed(){
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
        custom_namespaces: {
          'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
        },
        custom_elements: [
          {'itunes:subtitle': 'Interviewing creative individuals from the North East of the UK'},
          {'itunes:author': 'Jen Clark-Hall'},
          {'itunes:summary': 'We chat with creative individuals and businesses about how they have carved a path in the creative industries. From Digital Artists and  Architects to Potters and Production Assistants... and everything in between!'},
          {'itunes:explicit': 'clean'},
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
              text: 'Business'
            }},
            {'itunes:category': {
              _attr: {
                text: 'Careers'
              }
            }}
          ]}
        ]
    })
    return feed
  }

  private async addShows(feed, shows){
    for(let show of shows){
      let track = await this.minioService.getTrackInfo(show.number)
      feed.item({
        title:  show.title,
        description: show.description,
        url: `https://github.com/jackson147/thestoryboard-rss/blob/main/shows/${show.notesFile}`,
        categories: ['Creative','Media', 'North East', 'UK'],
        date: Date.parse(show.date), // any format that js Date can parse.
        enclosure: {
          url: `${show.url}`,
          size: track.Size, type: "audio/mpeg"
        },
        custom_elements: [
          {'itunes:explicit': 'no'}
        ]
      });
    }
    return feed
  }
}

export default RssController;
