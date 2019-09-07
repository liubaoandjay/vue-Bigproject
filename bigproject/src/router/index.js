import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'

Vue.use(Router)

const router=new Router({
  mode:'history',
  base:process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect:'/index'
    },
    {
      path:'/login',
      name:'login',
      component:()=>import('../views/login'),
      
    },
    {
      path:'/registered',
      name:'registered',
      component:()=>import('../views/registered')
    },
    {
      path:'/music',
      name:'music',
      component:()=>import('../views/music')
    }
  ]
})

let protect=['/music'];


router.beforeEach((to,from,next)=>{
  if(protect.includes(to.path)){
    let token =localStorage.getItem('token');
    if(token){
      next()
    }else{
      next('/login')
    }
  }else{
    next()
  }
})

export default router