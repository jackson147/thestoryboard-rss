import axios from "axios"

export class MinioService{
    static async getMinioFolderDetails(url: string){
        return axios.get(url)
    }
}