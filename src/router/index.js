import Vue from 'vue'
import Router from 'vue-router'
import VueSocketio from 'vue-socket.io';
import io from 'socket.io-client';
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'HelloWorld',
            component: HelloWorld,
            beforeEnter (to, from, next) {
                if (!Vue.prototype.$socket) {
                    Vue.use(VueSocketio, io("http://localhost:8000/", {}));
                }
                next()
            }
        }
    ]
})
