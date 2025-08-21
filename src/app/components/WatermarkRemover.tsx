'use client'
import { useEffect } from 'react'

export default function WatermarkRemover() {
  useEffect(() => {
    // Функция для удаления водяного знака
    const removeWatermark = () => {
      // Удаляем элементы по различным селекторам
      const selectors = [
        '[data-us-watermark]',
        '[class*="watermark"]',
        '[class*="Watermark"]',
        '[id*="watermark"]',
        '[id*="Watermark"]',
        'a[href*="unicorn.studio"]',
        'a[href*="Unicorn Studio"]',
        '[src*="unicorn.studio"]',
        '[src*="Unicorn Studio"]'
      ]

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector)
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none'
              el.style.visibility = 'hidden'
              el.style.opacity = '0'
              el.style.pointerEvents = 'none'
            }
            el.remove()
          })
        } catch (error) {
          // Игнорируем ошибки селекторов
        }
      })

      // Удаляем элементы по тексту содержимого
      const textSelectors = ['div', 'span', 'a', 'p']
      textSelectors.forEach(tagName => {
        try {
          const elements = document.querySelectorAll(tagName)
          elements.forEach(el => {
            const text = el.textContent || ''
            if (text.includes('unicorn.studio') || 
                text.includes('Unicorn Studio') ||
                text.includes('Made with unicorn.studio')) {
              if (el instanceof HTMLElement) {
                el.style.display = 'none'
                el.style.visibility = 'hidden'
                el.style.opacity = '0'
                el.style.pointerEvents = 'none'
              }
              el.remove()
            }
          })
        } catch (error) {
          // Игнорируем ошибки
        }
      })

      // Удаляем элементы по стилям
      try {
        const allElements = document.querySelectorAll('*')
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            const style = el.getAttribute('style') || ''
            if (style.includes('unicorn.studio') || style.includes('Unicorn Studio')) {
              el.style.display = 'none'
              el.style.visibility = 'hidden'
              el.style.opacity = '0'
              el.style.pointerEvents = 'none'
              el.remove()
            }
          }
        })
      } catch (error) {
        // Игнорируем ошибки
      }
    }

    // Удаляем водяной знак сразу
    removeWatermark()

    // Удаляем водяной знак после загрузки DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removeWatermark)
    }

    // Удаляем водяной знак после полной загрузки страницы
    window.addEventListener('load', removeWatermark)

    // Периодически проверяем и удаляем водяной знак
    const interval = setInterval(removeWatermark, 1000)

    // Очистка
    return () => {
      clearInterval(interval)
      document.removeEventListener('DOMContentLoaded', removeWatermark)
      window.removeEventListener('load', removeWatermark)
    }
  }, [])

  return null // Этот компонент не рендерит ничего
}

