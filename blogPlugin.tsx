import React, { useEffect } from 'react'
import { Plugin } from '../plugins'
import BlogDashboard from './ui'
import './main.css'
import { useBuilder } from '../../../func/hooks/useBuilder'
import { WxBlogsComponent } from './components/blogs'
import { WxBlogComponent } from './components/Blog'
import { usePluginApi } from '../../../func/hooks/useWxpluginAPI'

interface IWxLoginPluginProps {
  settings: Plugin
}


export default function WxBlogPlugin({
  settings,
}: IWxLoginPluginProps) {
  const { addAvailableComponent } = useBuilder()
  const { awaitRegistration, callPlugin } = usePluginApi()

  useEffect(() => {
    addAvailableComponent([
      WxBlogsComponent,
      WxBlogComponent
    ], 'WX Blogs')
    
    awaitRegistration("wx-auth").then((api) => {
      console.log('Plugin registered', api)
      callPlugin(api.namespace, "login")
    }).catch((err) => {
      console.log('Plugin registration failed', err)
    })
  }, [])
  
  return (
    <div className="popout dialog site__editor dialog__full __tool__edit web__editor__dialog Blog">
      <div className="dialog__body">
          <div className="dialog__header">
            <h3 className="dialog__title">WX Blog</h3>
          </div>
          <div className="dialog__content">
            <div className="dialog__body">
              <div className="auth__management__container">
                <BlogDashboard pluginSettings={settings} />
              </div>
          </div>
      </div>      
    </div>
    </div>
  )
}
