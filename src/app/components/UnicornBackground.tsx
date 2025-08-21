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

    // ДОБАВЛЯЕМ МОБИЛЬНУЮ ОПТИМИЗАЦИЮ
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    // Функция принудительной очистки памяти
    const forceGarbageCollection = () => {
      try {
        // 1. Принудительный вызов garbage collector (работает только в Chrome DevTools)
        if ((window as any).gc) {
          (window as any).gc();
        }
        
        // 2. Создаем и удаляем большой массив для принудительной очистки
        const forceCleanup = () => {
          let temp: any = new Array(1000000).fill(0);
          temp = null;
        };
        forceCleanup();
        
        // 3. Очищаем все возможные кэши браузера
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('unicorn') || name.includes('webgl')) {
                caches.delete(name);
              }
            });
          });
        }
        
        // 4. Очищаем Canvas контексты (если доступны)
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
          if (gl) {
            // Очищаем WebGL буферы
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) {
              ext.loseContext();
              // Восстанавливаем контекст через небольшую задержку
              setTimeout(() => {
                ext.restoreContext();
              }, 100);
            }
          }
        });
        
        console.log('🧹 Принудительная очистка памяти выполнена');
        
      } catch (error) {
        console.warn('Ошибка при очистке памяти:', error);
      }
    };

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

          // МОБИЛЬНАЯ ОПТИМИЗАЦИЯ - добавляем после инициализации
          if (isMobile) {
            
            // ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ПАМЯТИ каждые 15 секунд
            const memoryCleanupInterval = setInterval(() => {
              forceGarbageCollection();
            }, 15000);

            // Мониторинг использования памяти (если доступно)
            let memoryMonitorInterval: NodeJS.Timeout | null = null;
            
            if ('memory' in performance) {
              const monitorMemory = () => {
                const memInfo = (performance as any).memory;
                const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
                const totalMB = Math.round(memInfo.totalJSHeapSize / 1048576);
                
                console.log(`📊 Память: ${usedMB}MB / ${totalMB}MB`);
                
                // Если использование памяти превышает 150MB - принудительная очистка
                if (usedMB > 150) {
                  console.warn('⚠️ Высокое использование памяти, запуск очистки...');
                  forceGarbageCollection();
                }
                
                // Резервная пауза при критическом использовании памяти (250MB+)
                if (usedMB > 250) {
                  console.error('🚨 КРИТИЧЕСКОЕ использование памяти! Принудительная пауза...');
                  if (window.UnicornStudio && window.UnicornStudio.pause) {
                    window.UnicornStudio.pause();
                  }
                }
              };
              
              // Проверяем память каждые 10 секунд
              memoryMonitorInterval = setInterval(monitorMemory, 10000);
            }
            
            // Дополнительная очистка при изменении видимости страницы
            document.addEventListener('visibilitychange', () => {
              if (document.hidden && window.UnicornStudio && window.UnicornStudio.pause) {
                window.UnicornStudio.pause();
                // Очистка при сворачивании
                setTimeout(forceGarbageCollection, 500);
              } else if (!document.hidden && window.UnicornStudio && window.UnicornStudio.play) {
                window.UnicornStudio.play();
                // Очистка при возврате
                setTimeout(forceGarbageCollection, 1000);
              }
            });

            // Очистка при потере фокуса окна
            window.addEventListener('blur', () => {
              if (window.UnicornStudio && window.UnicornStudio.pause) {
                window.UnicornStudio.pause();
              }
              setTimeout(forceGarbageCollection, 500);
            });

            // Возобновление при получении фокуса
            window.addEventListener('focus', () => {
              if (window.UnicornStudio && window.UnicornStudio.play) {
                window.UnicornStudio.play();
              }
              setTimeout(forceGarbageCollection, 1000);
            });

            // Сохраняем интервалы для очистки при размонтировании
            (window as any).unicornCleanupIntervals = {
              memoryCleanup: memoryCleanupInterval,
              memoryMonitor: memoryMonitorInterval
            };
          }
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
      
      // Очищаем интервалы очистки памяти при размонтировании компонента
      if ((window as any).unicornCleanupIntervals) {
        const intervals = (window as any).unicornCleanupIntervals;
        if (intervals.memoryCleanup) clearInterval(intervals.memoryCleanup);
        if (intervals.memoryMonitor) clearInterval(intervals.memoryMonitor);
        delete (window as any).unicornCleanupIntervals;
      }
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