import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://localhub-backend-rgl5.onrender.com'

const http = axios.create({
  baseURL,
  timeout: 15000
})

export default http