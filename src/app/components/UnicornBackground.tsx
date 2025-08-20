'use client'
import { useEffect, useRef } from 'react'

interface UnicornBackgroundProps {
  projectId: string
  className?: string
}

declare global {
  interface Window {
    UnicornStudio: any
  }
}

export default function UnicornBackground({ 
  projectId, 
  className = "" 
}: UnicornBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Проверяем, загружен ли уже скрипт
    if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
      return
    }

    // Функция удаления водяного знака
    const removeWatermark = () => {
      // Добавляем CSS для скрытия водяного знака
      if (!document.getElementById('unicorn-watermark-hider')) {
        const style = document.createElement('style')
        style.id = 'unicorn-watermark-hider'
        style.textContent = `
          /* Скрываем все элементы с водяным знаком */
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
          
          /* Скрываем элементы по тексту - используем JavaScript для этого */
          
          /* Скрываем элементы по атрибутам */
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

      // Удаляем все элементы с водяным знаком
      const watermarkElements = document.querySelectorAll('[data-us-watermark]')
      watermarkElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
      
      // Удаляем по тексту содержимого
      const allDivs = document.querySelectorAll('div')
      allDivs.forEach(div => {
        if (div.textContent?.includes('Made with unicorn.studio') || 
            div.textContent?.includes('unicorn.studio') ||
            div.textContent?.includes('Unicorn Studio')) {
          div.style.display = 'none'
          div.style.visibility = 'hidden'
          div.style.opacity = '0'
          div.style.pointerEvents = 'none'
          div.remove()
        }
      })
      
      // Удаляем ссылки на unicorn.studio
      const allLinks = document.querySelectorAll('a')
      allLinks.forEach(link => {
        if (link.href?.includes('unicorn.studio') || 
            link.textContent?.includes('unicorn.studio') ||
            link.textContent?.includes('Unicorn Studio')) {
          link.style.display = 'none'
          link.style.visibility = 'hidden'
          link.style.opacity = '0'
          link.style.pointerEvents = 'none'
          link.remove()
        }
      })

      // Удаляем span элементы с водяным знаком
      const allSpans = document.querySelectorAll('span')
      allSpans.forEach(span => {
        if (span.textContent?.includes('unicorn.studio') || 
            span.textContent?.includes('Unicorn Studio')) {
          span.style.display = 'none'
          span.style.visibility = 'hidden'
          span.style.opacity = '0'
          span.style.pointerEvents = 'none'
          span.remove()
        }
      })

      // Удаляем элементы по классам
      const watermarkClasses = document.querySelectorAll('[class*="watermark"], [class*="Watermark"]')
      watermarkClasses.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none'
          el.style.visibility = 'hidden'
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
        }
        el.remove()
      })
    }

    // Загружаем скрипт
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js'
    
    script.onload = () => {
      try {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init()
          window.UnicornStudio.isInitialized = true
        }
        
        // Удаляем водяной знак после инициализации
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

    // Удаляем водяной знак сразу при загрузке
    removeWatermark()
    
    // Создаем MutationObserver для отслеживания новых элементов
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Проверяем новые элементы на наличие водяного знака
              if (node.hasAttribute('data-us-watermark') ||
                  node.className?.includes('watermark') ||
                  node.className?.includes('Watermark') ||
                  node.id?.includes('watermark') ||
                  node.id?.includes('Watermark') ||
                  node.textContent?.includes('unicorn.studio') ||
                  node.textContent?.includes('Unicorn Studio')) {
                node.style.display = 'none'
                node.style.visibility = 'hidden'
                node.style.opacity = '0'
                node.style.pointerEvents = 'none'
                node.remove()
              }
            }
          })
        }
      })
    })

    // Начинаем наблюдение за изменениями в DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Периодически проверяем и удаляем водяной знак
    const watermarkInterval = setInterval(removeWatermark, 500)
    
    // Очистка через 30 секунд
    setTimeout(() => {
      clearInterval(watermarkInterval)
    }, 30000)

    return () => {
      clearInterval(watermarkInterval)
      observer.disconnect()
    }
    
  }, [projectId])

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