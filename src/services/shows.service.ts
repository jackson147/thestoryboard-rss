import { getShowsMarkdown } from '@/utils/getShowsMarkdown'

export class ShowsService{
    getShows(){
        return getShowsMarkdown('all')
    }
}