import Swiper from 'swiper'
import { Autoplay, Controller, Navigation, Pagination } from 'swiper/modules'
// import { register } from 'swiper/element/bundle'

Swiper.use([Autoplay, Controller, Navigation, Pagination])
// @ts-ignore
window.Swiper = Swiper

function init() {
  // register()
}

export default { init }
