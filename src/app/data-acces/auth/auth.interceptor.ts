import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Проверяем, что запрос направлен к API MoySklad
  if (req.url.includes('/api/moysklad')) {
    const cloned = req.clone({
      setHeaders: {
        // Добавляем заголовок Authorization с токеном
        Authorization: `Bearer c50c2cd8426f7172b1b086d576df4ae5b6715bb7`,
        // Убираем User-Agent и Accept-Encoding, так как они вызывают ошибку
      },
    });
    return next(cloned);  // Отправляем измененный запрос
  }
  return next(req);  // Если запрос не к MoySklad, оставляем без изменений
};
