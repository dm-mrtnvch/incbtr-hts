import {app} from "./settings";

const PORT = 3020

app.listen(PORT, () => {
  console.log('PORT', `App started on ${PORT} port`)
})
