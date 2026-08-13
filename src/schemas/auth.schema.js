const {z} =require("zod")

const registerSchema=z.object({

    firstName: z.string().min(1),
    lastName:  z.string().min(1),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    phone: z.string().regex(/^[0-9]{11}$/,"Telefon numarası 11 haneli olmalı"),
    password: z.string().min(8,"Şifre en az 8 karakter olmalıdır."),
    passwordConfirm: z.string(),
}).refine((d)=>d.password ===d.passwordConfirm,{
    message: 'Şifreler eşleşmiyor.',path: ['passwordConfirm'],
} ) 

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
module.exports={registerSchema, loginSchema}