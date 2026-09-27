# Smart Dashboard Backend

لوحة تحكم ذكية مع Django REST API

## المتطلبات

- Python 3.10+
- MySQL (اختياري، يمكن استخدام SQLite للتطوير)

## التثبيت

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # على Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

> ملاحظة: الحزمة `mysqlclient` تحتاج مكتبات MySQL على النظام
> (مثلاً `sudo apt install default-libmysqlclient-dev build-essential pkg-config` على Ubuntu).

## الإعدادات (متغيرات البيئة)

كل الإعدادات الحساسة تُقرأ من متغيرات البيئة أو من ملف `backend/.env`، ولا توجد أي أسرار داخل الكود.
الملف `.env` مُتجاهل في git ويجب **ألا** يُرفع أبداً.

```bash
cp .env.example .env
# ولّد مفتاحاً سرياً وضعه في DJANGO_SECRET_KEY داخل .env
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

للتطوير المحلي ضع في `.env`:

```env
DJANGO_SECRET_KEY=<المفتاح الذي ولّدته>
DJANGO_DEBUG=True
```

| المتغير | الافتراضي | الوصف |
|---|---|---|
| `DJANGO_SECRET_KEY` | — (إلزامي عند إيقاف DEBUG) | المفتاح السري لـ Django، ويُستخدم أيضاً لتوقيع JWT |
| `DJANGO_DEBUG` | `False` | فعّله (`True`) للتطوير المحلي فقط |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | أسماء النطاقات المسموح بها، مفصولة بفواصل |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | فارغ | مثال: `https://dashboard.example.com` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5500,http://127.0.0.1:5500` | عناوين الواجهة الأمامية المسموح لها باستدعاء الـ API |
| `DB_ENGINE` | `sqlite` | `sqlite` أو `mysql` |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` | — | بيانات اتصال MySQL |
| `DJANGO_SECURE_SSL_REDIRECT` | `True` (في الإنتاج) | تحويل HTTP إلى HTTPS |
| `DJANGO_BEHIND_PROXY` | `False` | فعّله فقط إذا كان هناك reverse proxy يضبط `X-Forwarded-Proto` |
| `DJANGO_SECURE_HSTS_SECONDS` | `0` | مدة HSTS؛ ابدأ بـ `3600` ثم ارفعها إلى `31536000` |
| `AUTH_THROTTLE_RATE` | `10/minute` | حد محاولات تسجيل الدخول والتسجيل |
| `SEED_ADMIN_PASSWORD` | فارغ | كلمة مرور المستخدم التجريبي (تُولَّد عشوائياً إذا تُركت فارغة) |

إذا كان `DJANGO_DEBUG=True` ولم يُضبط `DJANGO_SECRET_KEY`، يُستخدم مفتاح مؤقت عشوائي
(تنتهي الجلسات والتوكنات عند كل إعادة تشغيل). بدون `DEBUG` يرفض التطبيق العمل بدون مفتاح.

## إعداد قاعدة البيانات

### للتطوير (SQLite - افتراضي)
لا يتطلب أي إعداد إضافي.

### للإنتاج (MySQL)
1. قم بإنشاء قاعدة بيانات ومستخدم خاص بالتطبيق:
```sql
CREATE DATABASE smart_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'smart_dashboard'@'localhost' IDENTIFIED BY '<كلمة مرور قوية>';
GRANT ALL PRIVILEGES ON smart_dashboard.* TO 'smart_dashboard'@'localhost';
```

2. اضبط في `.env` (أو في متغيرات بيئة الخادم):
```env
DB_ENGINE=mysql
DB_NAME=smart_dashboard
DB_USER=smart_dashboard
DB_PASSWORD=<كلمة مرور قوية>
DB_HOST=localhost
DB_PORT=3306
```

## تشغيل السيرفر

```bash
# تطبيق التحديثات على قاعدة البيانات
python manage.py migrate

# إنشاء بيانات تجريبية (للتطوير فقط)
# تُستخدم SEED_ADMIN_PASSWORD إن وُجدت، وإلا تُولَّد كلمة مرور عشوائية وتُطبع مرة واحدة
python manage.py seed_demo

# تشغيل السيرفر
python manage.py runserver
```

### تشغيل الواجهة الأمامية

من جذر المستودع:

```bash
python -m http.server 5500
```

ثم افتح `http://localhost:5500`. إذا استخدمت منفذاً أو نطاقاً آخر أضفه إلى `CORS_ALLOWED_ORIGINS`.
لتغيير عنوان الـ API عرّف `window.API_BASE_URL` قبل تحميل `api-service.js`.

### الاختبارات

```bash
DJANGO_DEBUG=True python manage.py test api
```

## النشر (Production)

- لا تضبط `DJANGO_DEBUG` (القيمة الافتراضية `False`).
- اضبط `DJANGO_SECRET_KEY` بقيمة فريدة وسرية لكل بيئة.
- اضبط `DJANGO_ALLOWED_HOSTS` و `DJANGO_CSRF_TRUSTED_ORIGINS` و `CORS_ALLOWED_ORIGINS` بنطاقاتك الفعلية.
- استخدم خادم WSGI مثل gunicorn بدلاً من `runserver`، وشغّل `python manage.py collectstatic`.
- تحقق من الإعدادات: `python manage.py check --deploy`
- لا تشغّل `seed_demo` على الإنتاج.

## API Endpoints

### المصادقة
- `POST /api/auth/register/` - تسجيل جديد
- `POST /api/auth/login/` - تسجيل دخول
- `POST /api/auth/logout/` - تسجيل خروج
- `GET /api/auth/me/` - المستخدم الحالي

### المهام
- `GET /api/tasks/` - جلب المهام
- `POST /api/tasks/` - إنشاء مهمة
- `PUT /api/tasks/{id}/` - تحديث مهمة
- `DELETE /api/tasks/{id}/` - حذف مهمة
- `PATCH /api/tasks/{id}/toggle/` - تبديل الإكمال

### الإشعارات
- `GET /api/notifications/` - جلب الإشعارات
- `PATCH /api/notifications/{id}/mark_read/` - تحديد كمقروء

### النشاطات
- `GET /api/activities/` - جلب النشاطات

### الإحصائيات
- `GET /api/statistics/dashboard/` - إحصائيات لوحة التحكم
- `GET /api/statistics/chart/` - بيانات الرسم البياني

> حُذفت نقطة النهاية العامة `POST /api/seed/`؛ استخدم الأمر `python manage.py seed_demo` بدلاً منها.
