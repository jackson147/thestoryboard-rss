import axios from "axios";
import config from "config";
import xml2json from 'xml2json'

class MinioService {

  private url: string = config.get("minio.url");

  public getTrackInfo(trackNumber: number){
    let padded = String(trackNumber).padStart(3, '0')
    return this.getAllTracks()
      .then((tracks) => {
        return tracks[`${padded}.mp3`]
      })
  }

  public getAllTracks(){
  return axios.get(`${this.url}`)
    .then((response) =>{
      let jsonTracks = JSON.parse(xml2json.toJson(response.data)).ListBucketResult.Contents
      let tracksMap = jsonTracks.reduce((map, obj) => {
        map[obj.Key]=obj
        return map
      }, {})
      return tracksMap
    })
  }
}

export default MinioService;
