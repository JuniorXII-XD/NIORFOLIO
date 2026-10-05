# ตั้งค่า Nior Portfolio บน Vercel + Supabase

เวอร์ชันนี้คงหน้าเว็บ อินโทร แอนิเมชัน และรูปโปรไฟล์เดิม มีล็อกอินด้วยอีเมล/รหัสผ่าน แก้โปรไฟล์ เพิ่ม–แก้ไข–ลบผลงาน และอัปโหลดรูปปกผลงาน

ต้องตั้งค่า Supabase ก่อนใช้หลังบ้านจริง ไม่มีรหัสผ่านเริ่มต้น ไม่ต้องส่งรหัสผ่านให้ผู้ช่วย

## 1. เตรียม Supabase

ใช้ Supabase ผ่าน Vercel Marketplace / Storage หรือสร้างโปรเจกต์ใหม่ที่ https://supabase.com/dashboard แล้วเชื่อมด้วยตัวแปรในขั้นตอนที่ 5 แนะนำใช้โปรเจกต์ใหม่สำหรับเว็บนี้ เลือกภูมิภาคใกล้ผู้ชม เช่น Singapore จดรหัสผ่านฐานข้อมูลไว้กับตัว เว็บนี้ไม่ต้องใช้รหัสผ่านฐานข้อมูลในโค้ด

บนมือถือ เปิดโหมดเว็บไซต์เดสก์ท็อปหากเมนูแสดงไม่ครบ

## 2. สร้างตารางและพื้นที่เก็บรูป

1. ใน Supabase เปิด SQL Editor → New query
2. คัดลอกเนื้อหาทั้งหมดของ `supabase/schema.sql` ไปวาง แล้วกด Run
3. จะได้ตาราง `portfolio_profile`, `portfolio_projects`, `portfolio_owners` และ bucket `portfolio-media`
4. คนทั่วไปอ่านโปรไฟล์และผลงานได้ เฉพาะเจ้าของแก้ไขได้ รูปที่อัปโหลดเป็นรูปสาธารณะสำหรับพอร์ต

## 3. สร้างบัญชีเจ้าของ

1. Authentication → Users → Add user → Create new user
2. ใส่อีเมลและรหัสผ่านของเนียร์ เปิด Auto Confirm User หากมีตัวเลือกนี้
3. เปิด `supabase/add-owner.sql` แก้ `YOUR_EMAIL_HERE` เป็นอีเมลเดียวกับข้อ 2
4. รัน SQL ที่แก้แล้วใน SQL Editor ต้องมี `user_id` แสดงกลับมา 1 แถว ถ้าไม่มี ให้ตรวจว่าอีเมลตรงกับผู้ใช้ที่สร้างไว้
5. ในการตั้งค่า Authentication / Sign In / Providers ปิดการอนุญาตให้ผู้ใช้ใหม่สมัครเอง ผู้ชมไม่ต้องมีบัญชี

สิทธิ์เจ้าของตรวจจาก `portfolio_owners` ผู้ใช้ทั่วไปเพิ่มตัวเองเข้าตารางนี้ไม่ได้

## 4. อัปโหลดโค้ดขึ้น GitHub

แตก ZIP ก่อน แล้วอัปโหลดเนื้อหาในโฟลเดอร์ `Nior-Portfolio` ซึ่งมี `package.json` อยู่ด้านใน ไม่ใช่อัปโหลด ZIP ก้อนเดียว

วิธีง่ายคือใช้ repository ใหม่ อัปโหลดไฟล์ทั้งหมดรวม `package-lock.json`, `vercel.json`, โฟลเดอร์ `supabase` และ `public` ไม่ต้องอัปโหลด `node_modules`, `.next` หรือ `.env.local`

ถ้าใช้ repository เดิม ให้แทนที่ด้วยชุดนี้ และนำไฟล์เก่าต่อไปนี้ออกด้วย: `vite.config.ts`, `build/`, `db/`, `drizzle/`, `drizzle.config.ts`, `cloudflare-env.d.ts`, `scripts/`, `.openai/`, `app/chatgpt-auth.ts`, `lib/connector*`, `components/connector-error.tsx` และ `app/api/media/` เก็บ `.git` ของ repository ไว้

## 5. ตั้งค่า Vercel แล้ว Deploy

| ช่อง | ค่า |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | โฟลเดอร์ที่มี package.json ถ้าอยู่ราก repo ใช้ `./` |
| Build Command | `npm run build` |
| Install Command | `npm ci` |
| Output Directory | ค่าเริ่มต้นของ Next.js ไม่ใช้ dist |
| Node.js | 22.x หรือรุ่นใหม่กว่าที่รองรับ |

`vercel.json` กำหนดคำสั่งให้แล้ว หากเคย Override เป็น vinext / Vite ให้ลบค่าที่ขัดกันออก Build ใน package.json ใช้ `next build --webpack`

เพิ่ม Environment Variables สองค่า:

| ชื่อตัวแปร | ค่าจาก Supabase |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL เช่น https://xxxxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) หรือ legacy anon key |

หาได้จากปุ่ม Connect หรือ Settings → API Keys / Data API ของ Supabase ต้องเป็นโปรเจกต์เดียวกับที่รัน SQL

**ห้ามใช้ service_role หรือ secret key ใน NEXT_PUBLIC_*:** ชุดนี้ใช้ publishable/anon key เท่านั้น ไม่ต้องใช้คีย์ที่ข้าม RLS

ตั้งค่าให้ Production และ Preview ที่ต้องการ แล้ว Deploy ถ้าเพิ่มหรือเปลี่ยนตัวแปรภายหลังต้อง Redeploy เพราะ NEXT_PUBLIC ถูกฝังตอน Build

ถ้ายังไม่ใส่ตัวแปร หน้าเว็บจะแสดงข้อมูลตัวอย่างและรูปเดิม หน้า Login จะแจ้งว่ายังไม่เชื่อมหลังบ้าน การ Build ผ่านอย่างเดียวยังไม่แปลว่าเชื่อม Supabase ครบ

## 6. เข้าใช้งาน

เปิด `https://ชื่อเว็บ.vercel.app/studio` → ระบบพาไป `/login` → ใช้บัญชีจากขั้นตอนที่ 3

- แก้ชื่อ คำแนะนำตัว และรูปโปรไฟล์
- เพิ่ม แก้ไข ลบผลงาน และใส่รูปปก
- รูปรองรับ JPG / PNG / WebP / GIF ไม่เกิน 20 MB
- รูปส่งตรงจากเบราว์เซอร์ไป Supabase ไม่ผ่าน Vercel Function
- รูปที่ถอดออกยังอยู่ใน Storage เพื่อไม่เผลอลบไฟล์ที่ใช้ซ้ำ คืนพื้นที่ได้โดยลบรูปที่ไม่ใช้แล้วใน Supabase Storage

## 7. ตรวจหลัง Deploy

1. เปิดเว็บโดยไม่ล็อกอิน ตรวจรูปและผลงาน
2. เข้า `/studio` ต้องไป Login
3. ล็อกอินเจ้าของ เพิ่มผลงานทดสอบพร้อมรูป รีเฟรชแล้วข้อมูลต้องยังอยู่
4. เปิดโหมดไม่ระบุตัวตน ต้องเห็นผลงานใหม่ แต่ไม่มีปุ่มแก้ไข
5. แก้ผลงาน เปลี่ยนโปรไฟล์ แล้วลบผลงานทดสอบ
6. ออกจากระบบ เปิด `/studio` ใหม่ ต้องไป Login

## แก้ปัญหา

- บัญชีไม่มีสิทธิ์: ตรวจอีเมลใน `add-owner.sql` และผลลัพธ์ user_id
- เชื่อมหลังบ้านไม่ได้: ตรวจ URL/key และรัน `schema.sql` ให้ครบ
- อัปโหลดไม่ผ่าน: ตรวจ bucket `portfolio-media`, พื้นที่, ขนาด/ชนิดรูป และสิทธิ์เจ้าของ อย่าปิด RLS
- Build ยังแสดง vinext: Vercel ใช้ branch / root directory / โค้ดเก่า
- ลืมรหัสผ่าน: จัดการบัญชีผ่าน Supabase Authentication ชุดนี้ยังไม่มีหน้าขอรีเซ็ตรหัสผ่านทางอีเมล
- เนื้อหาจากเว็บเดิมไม่มา: ZIP เดิมมีซอร์สและรูปโปรไฟล์แนบ แต่ไม่มีฐานข้อมูลหรือไฟล์อัปโหลดของโฮสต์เดิม ต้องเพิ่มใหม่หรือส่งออกจากระบบเดิมก่อน

## รันในคอมพิวเตอร์

ใช้ Node.js 22.13+ คัดลอก `.env.example` เป็น `.env.local` แล้วใส่สองตัวแปร

```bash
npm ci
npm run dev
```

ตรวจและ Build:

```bash
npm test
npm run typecheck
npm run build
npm start
```

## อ้างอิง

- https://supabase.com/docs/guides/auth/server-side/nextjs
- https://supabase.com/docs/guides/storage/security/access-control
- https://vercel.com/docs/builds/configure-a-build
