import express, {Request, Response} from 'express'

export const app = express()
app.use(express.json())

type RequestWithParams<P> = Request<P, {}, {}, {}>
type RequestWithBody<B> = Request<{}, {}, B, {}>
type RequestWithBodyAndParams<P, B> = Request<P, {}, B, {} >

type ErrorsMessages  = {
  field: string
  message: string
}

type ErrorType = {
  errorsMessages: ErrorsMessages[]
}

enum AvailableResolutionsEnum {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160'
}

type VideoType = {
  id: number,
  title: string,
  author: string,
  canBeDownloaded: boolean,
  minAgeRestriction: number | null,
  createdAt: string,
  publicationDate: string,
  availableResolutions: AvailableResolutionsEnum[]
}

const videoDb: VideoType[] = [
  {
    id: 0,
    title: "string",
    author: "string",
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: "2023-08-22T19:27:26.270Z",
    publicationDate: "2023-08-22T19:27:26.270Z",
    availableResolutions: [
      AvailableResolutionsEnum.P144
    ]
  }
]



app.get('/videos', (req: Request, res: Response) => {
  res.send(videoDb)
})
app.get('/videos/:id', (req: RequestWithParams<{id: string}>, res: Response) => {
  const { id } = req.params
  const video = videoDb.find(video => String(video.id) === id)

  if(!video){
    res.sendStatus(404)
    return
  }

  res.send(video)
})
app.post('/videos', (req: RequestWithBody<{
  title: string,
  author: string,
  availableResolutions: AvailableResolutionsEnum[]
}>, res: Response) => {
  let {title, author, availableResolutions} = req.body

  let errors: ErrorType = {
    errorsMessages: []
  }

  if(!title || !title.length || title.trim().length > 40) {
    errors.errorsMessages.push({
      field: 'title',
      message: 'Invalid title field'
    })
  }

  if(!author || !author.length || author.trim().length > 20) {
    errors.errorsMessages.push({
      field: 'author',
      message: 'Invalid author field'
    })
  }

  if(Array.isArray(availableResolutions) && availableResolutions.length){
    availableResolutions.map(resolution  => {
      !AvailableResolutionsEnum[resolution] && errors.errorsMessages.push({
        field: 'availableResolutions',
        message: 'Invalid availableResolutions field'
      })
    })
  } else {
    availableResolutions = []
  }

  if(errors.errorsMessages.length) {
    res.status(400).send(errors)
    return
  }

  const createdAt = new Date()
  const publicationDate = new Date()
  publicationDate.setDate(createdAt.getDate() + 1)

  const newVideo: VideoType = {
    id: +(new Date()),
    title,
    author,
    canBeDownloaded: false,
    availableResolutions,
    minAgeRestriction: null,
    createdAt: createdAt.toISOString(),
    publicationDate: publicationDate.toISOString()
  }
  console.log('vv', videoDb)
  console.log('vv', videoDb)
  videoDb.push(newVideo)

  res.status(201).send(newVideo)
})

app.put('/videos/:id', (req: RequestWithBodyAndParams<{id: string}, VideoType>, res) => {
  const {id} = req.params
  let {author, canBeDownloaded, availableResolutions, minAgeRestriction, title, publicationDate, createdAt} = req.body

  const video = videoDb.find(video => String(video.id) === id)

  if(!video) {
    res.sendStatus(404)
    return
  }

  let errors: ErrorType = {
    errorsMessages: []
  }

  if(!title || !title.length || title.trim().length > 40) {
    errors.errorsMessages.push({
      field: 'title',
      message: 'Invalid title field'
    })
  }

  if(!author || !author.length || author.trim().length > 20) {
    errors.errorsMessages.push({
      field: 'author',
      message: 'Invalid author field'
    })
  }

  if(Array.isArray(availableResolutions) && availableResolutions.length > 0) {
    availableResolutions.map(resolution => {
      !AvailableResolutionsEnum[resolution] && errors.errorsMessages.push({
        field: 'availableResolutions',
        message: 'Invalid availableResolutions field'
      })
    })
  } else {
    availableResolutions = []
  }

  if(canBeDownloaded && typeof canBeDownloaded !== "boolean"){
    errors.errorsMessages.push({
      field: 'canBeDownloaded',
      message: 'Invalid canBeDownloaded field'
    })
  }

  if (minAgeRestriction && (typeof minAgeRestriction !== 'number' || minAgeRestriction < 1 || minAgeRestriction > 18)) {
    errors.errorsMessages.push({
      field: 'minAgeRestriction',
      message: 'Invalid minAgeRestriction field'
    })
  }

  if(errors.errorsMessages.length > 0){
    res.status(400).send(errors)
    return
  }

  const updatedVideo: VideoType = {
    id: +id,
    availableResolutions,
    minAgeRestriction: minAgeRestriction || null,
    title,
    author,
    canBeDownloaded: canBeDownloaded || false,
    createdAt,
    publicationDate
  }

  Object.assign(video, updatedVideo)
  res.sendStatus(204)
})

app.delete('/videos/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const { id } = req.params

  const videoIndexToRemove = videoDb.findIndex(video => String(video.id) === id)

  if(videoIndexToRemove !== -1){
    videoDb.splice(videoIndexToRemove, 1)
    res.sendStatus(204)
    return
  } else {
    res.sendStatus(404)
    return
  }
})

app.delete('/testing/all-data', (req: Request, res: Response) => {
  videoDb.length = 0
  res.sendStatus(204)
})
