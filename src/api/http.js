import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://port-0-localhub-backend-mpdltcf63345e3f5.sel3.cloudtype.app'

const http = axios.create({
  baseURL,
  timeout: 15000
})

export default http