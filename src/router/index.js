import Vue from 'vue'
import Router from 'vue-router'
import VueSocketio from 'vue-socket.io';
import io from 'socket.io-client';
import ImageFrame from '@/components/ImageFrame';
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue);
Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Image Frame',
            component: ImageFrame
        }
    ]
})
