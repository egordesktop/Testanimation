'use client'
import { useEffect, useRef, useState } from 'react'

interface UnicornBackgroundProps {
  projectId: string
  className?: string
  // Пути к видео файлам для мобильных
  mobileVideoWebm?: string
  mobileVideoMp4?: string
}

declare global {
  interface Window {
    UnicornStudio: any
  }
}

export default function UnicornBackground({ 
  projectId, 
  className = "",
  mobileVideoWebm = "/background-mobile.webm",
  mobileVideoMp4 = "/background-mobile.mp4"
}: UnicornBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Определяем мобильное устройство
  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => {
      const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const screenSize = window.innerWidth <= 768
      const touchDevice = 'ontouchstart' in window
      
      return userAgent || screenSize || touchDevice
    }
    
    setIsMobile(checkMobile())
    
    // Переопределяем при изменении размера окна
    const handleResize = () => {
      setIsMobile(checkMobile())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Логика для десктопа - UnicornStudio
  useEffect(() => {
    // Выходим, если это мобильное устройство или компонент не готов
    if (!isClient || isMobile) return
    
    // Проверяем, загружен ли уже скрипт
    if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
      return
    }

    // Функция удаления водяного знака
    const removeWatermark = () => {
      if (!document.getElementById('unicorn-watermark-hider')) {
        const style = document.createElement('style')
        style.id = 'unicorn-watermark-hider'
        style.textContent = `
          [data-us-watermark],
          [class*="watermark"],
          [class*="Watermark"],
          [id*="watermark"],
          [id*="Watermark"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          
          [href*="unicorn.studio"],
          [src*="unicorn.studio"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `
        document.head.appendChild(style)
      }

      // Удаляем элементы с водяным знаком
      const watermarkSelectors = [
        '[data-us-watermark]',
        'div, a, span'
      ]
      
      document.querySelectorAll(watermarkSelectors.join(', ')).forEach(el => {
        const text = el.textContent?.toLowerCase() || ''
        const href = (el as HTMLAnchorElement).href?.toLowerCase() || ''
        
        if (text.includes('unicorn.studio') || 
            text.includes('made with unicorn.studio') ||
            href.includes('unicorn.studio') ||
            el.hasAttribute('data-us-watermark')) {
          el.remove()
        }
      })
    }

    // Загружаем скрипт UnicornStudio
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js'
    
    script.onload = () => {
      try {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init()
          window.UnicornStudio.isInitialized = true
        }
        
        setTimeout(() => {
          removeWatermark()
        }, 1000)
        
      } catch (err) {
        console.error('Ошибка при инициализации UnicornStudio:', err)
      }
    }
    
    script.onerror = (err) => {
      console.error('Ошибка загрузки скрипта UnicornStudio:', err)
    }
    
    document.head.appendChild(script)
    removeWatermark()
    
    // MutationObserver для новых водяных знаков
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const text = node.textContent?.toLowerCase() || ''
              if (text.includes('unicorn.studio') || 
                  node.hasAttribute('data-us-watermark')) {
                node.remove()
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    const watermarkInterval = setInterval(removeWatermark, 500)
    
    setTimeout(() => {
      clearInterval(watermarkInterval)
    }, 30000)

    return () => {
      clearInterval(watermarkInterval)
      observer.disconnect()
    }
    
  }, [projectId, isClient, isMobile])

  // Логика для мобильных - управление видео
  useEffect(() => {
    if (!isClient || !isMobile || !videoRef.current) return

    const video = videoRef.current
    
    // Обработка видимости страницы для экономии батареи
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
      } else {
        video.play().catch(console.warn)
      }
    }

    // Пауза при потере фокуса окна
    const handleBlur = () => {
      video.pause()
    }

    // Возобновление при получении фокуса
    const handleFocus = () => {
      video.play().catch(console.warn)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)  
      window.removeEventListener('focus', handleFocus)
    }
  }, [isClient, isMobile])

  // Не рендерим ничего до определения типа устройства
  if (!isClient) {
    return null
  }

  // Рендер для мобильных устройств - видео
  if (isMobile) {
    return (
      <video
        ref={videoRef}
        className={`fixed inset-0 w-screen h-screen -z-10 object-cover ${className}`}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
          objectFit: 'cover'
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onLoadStart={() => console.log('📱 Загружаем видео для мобильного устройства')}
        onCanPlay={() => console.log('✅ Видео готово к воспроизведению')}
        onError={(e) => console.error('❌ Ошибка загрузки видео:', e)}
      >
        <source src={mobileVideoWebm} type="video/webm" />
        <source src={mobileVideoMp4} type="video/mp4" />
        
        {/* Fallback для браузеров без поддержки видео */}
        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      </video>
    )
  }

  // Рендер для десктопа - UnicornStudio
  return (
    <div 
      ref={containerRef}
      data-us-project={projectId}
      className={`fixed inset-0 w-screen h-screen -z-10 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        minWidth: '100vw',
        minHeight: '100vh'
      }}
    />
  )
}