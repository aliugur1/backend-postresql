const {z} =require("zod")

const registerSchema=z.object({

    firstName: z.string().min(1),
    lastName:  z.string().min(1),
    email: z.string().email(),
    phone: z.string().regex(/^[0-9]{11}$/,"Telefon numarası 11 haneli olmalı"),
    password: z.string().min(8),
    passwordConfirm: z.string(),
}).refine((d)=>d.password ===d.passwordConfirm,{
    message: 'Şifreler eşleşmiyor.',path: ['passwordConfirm'],
} ) 

module.exports={registerSchema}