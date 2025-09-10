import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedDevelopment(prisma: PrismaClient) {
  console.log('🔧 Seeding development data...');

  // Create test users
  const devUsers = [];
  const user1 = await prisma.user.upsert({
    where: {
      email: 'admin@gmail.com',
    },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Administrator',
      password: await bcrypt.hash('123456', 10),
    },
  });
  const user2 = await prisma.user.upsert({
    where: {
      email: 'bruce.wayne@wayne.com',
    },
    update: {},
    create: {
      email: 'bruce.wayne@wayne.com',
      name: 'Bruce Wayne',
      password: await bcrypt.hash('123456', 10),
    },
  });

  const process1 = await prisma.process.upsert({
    where: {
      title: 'Flood Prevention and Environmental Protection Strategy 2025',
    },
    update: {},
    create: {
      title: 'Flood Prevention and Environmental Protection Strategy 2025',
      title_ur: 'سیلاب سے بچاؤ اور ماحولیاتی تحفظ کی حکمت عملی 2025',
      description:
        "Following the devastating floods of 2024-2025 that killed over 300 people in Khyber Pakhtunkhwa, this consultation seeks citizen input on comprehensive flood prevention measures. We need to address illegal construction near riverbeds, deforestation in mountainous areas, inadequate drainage systems, and climate adaptation strategies. Your participation will help shape Pakistan's environmental protection policies and save lives.",
      description_ur:
        'خیبر پختونخوا میں 300 سے زیادہ افراد کی ہلاکت کا باعث بننے والے 2024-2025 کے تباہ کن سیلاب کے بعد، یہ مشاورت سیلاب سے بچاؤ کے جامع اقدامات پر شہریوں کی رائے طلب کرتی ہے۔ ہمیں دریاؤں کے کنارے غیر قانونی تعمیرات، پہاڑی علاقوں میں جنگلات کی کٹائی، ناکافی نکاسی آب کے نظام، اور موسمیاتی تبدیلی سے نمٹنے کی حکمت عملی پر توجہ دینی ہوگی۔',
      status: 'active',
      category: 'environment',
      start_date: '2025-08-17T07:38:54.420108+00:00',
      end_date: '2025-10-01T07:38:54.420108+00:00',
      created_by: user2.id,
      organization: 'National Disaster Management Authority (NDMA)',
      participation_count: 1,
      process_type: 'consultation',
      scope: 'city',
      signature_threshold: 0,
      current_signatures: 0,
      signature_deadline: null,
      response_required: false,
      response_deadline: null,
      government_response: null,
      government_response_ur: null,
      response_date: null,
      visibility: 'public',
      participation_method: 'open',
      min_participants: 0,
      max_participants: null,
      verification_required: false,
    },
  });

  const proposal1 = await prisma.proposal.upsert({
    where: {
      title: "Plan to Stop Punjab's Floods: Learning from Netherlands",
    },
    update: {},
    create: {
      title: "Plan to Stop Punjab's Floods: Learning from Netherlands",
      process_id: process1.id,
      title_ur:
      'پنجاب میں سیلاب کی روک تھام کا نیا منصوبہ: آئیے نیدرلینڈز سے سیکھیں',
      description:
        "The recent floods in Punjab have been devastating. We see this happen again and again. It's time to  start building a real, long-term solution to protect our homes and families.\n\nI’ve been looking at how the Netherlands handles water. Most of their country is below sea level, yet they are one of the safest places in the world from floods. Their main idea is simple: don't fight the water, make space for it. We can use their ideas here in Punjab.\nHere’s a simple plan:\n\n1. Give Our Rivers Room to Breathe\nThe biggest problem is that we have built houses and businesses right on the riverbeds. When the water rises, it has nowhere to go but into our towns.\nThe Action: We need to clear all illegal construction from the river floodplains. Let's mark these areas and make it law that no one can build there. This is what the Dutch call the \"Room for the River\" program. It gives the floodwater a safe place to go without harming anyone.\n\n2. Plant Trees as a Natural Shield\nWhen it rains heavily in the mountains, the water rushes down and floods us because there are not enough trees to slow it down.\nThe Action: We need a massive tree-planting campaign. We should plant trees in the mountains and create green belts along our riverbanks. Trees soak up water like a sponge and their roots hold the soil together, which helps reduce landslides and flash floods.\n\n3. Fix Our Clogged Drains\nOur city drains are old, full of trash, and can't handle heavy rain. That's why our streets turn into rivers.\nThe Action: We need to clean and rebuild our drainage systems. In our cities, we can create more parks and green spaces that can absorb rainwater. This is much smarter than just letting the water flood our streets.\n\n4. Get Ready for Future Rains\nWe know climate change means more extreme weather. We need to be prepared.\nWatch these two videos to explore how Netherlands beats the ocean : \nThe Action: We must have a better early warning system. People need to get alerts on their phones with enough time to move to safety. We also need to build stronger roads and bridges that can survive floods.\n\nWatch these two videos here to explore how the Netherlands beats the ocean :\nhttps://www.youtube.com/watch?v=XoEZvSl5Cg8\nhttps://www.youtube.com/watch?v=C7vx4AKRACQ\n\nAll in all, this is not a quick fix. It’s a long-term plan that needs real commitment from the government and support from us, the citizens. If the Dutch can protect their country from the sea, we can surely learn to live safely with our rivers. \n",
      description_ur:
        'پنجاب میں حالیہ سیلاب بہت تباہ کن رہے ہیں۔ ہم یہ بار بار ہوتا ہوا دیکھتے ہیں۔ اب وقت آگیا ہے کہ ہم اپنے گھروں اور خاندانوں کو بچانے کے لیے ایک حقیقی اور طویل مدتی حل بنانا شروع کریں۔\n\nمیں نے دیکھا ہے کہ نیدرلینڈز پانی کے مسئلے سے کیسے نمٹتا ہے۔ ان کا زیادہ تر ملک سطح سمندر سے نیچے ہے، پھر بھی وہ سیلاب سے دنیا کے محفوظ ترین ممالک میں سے ایک ہیں۔ ان کا بنیادی اصول بہت سادہ ہے: پانی سے لڑو مت، اس کے لیے جگہ بناؤ۔ ہم ان کے خیالات کو یہاں پنجاب میں استعمال کر سکتے ہیں۔\n\nیہ رہا ایک سادہ منصوبہ:\n\n۱۔ ہمارے دریاؤں کو سانس لینے کی جگہ دیں\n\nسب سے بڑا مسئلہ یہ ہے کہ ہم نے دریاؤں کی گزرگاہوں پر گھر اور کاروبار بنا لیے ہیں۔ جب پانی بڑھتا ہے، تو اسے ہمارے شہروں میں داخل ہونے کے علاوہ کوئی راستہ نہیں ملتا۔\n\nکرنا کیا ہے؟ ہمیں دریاؤں کی سیلابی گزرگاہوں سے تمام غیر قانونی تعمیرات کو ہٹانے کی ضرورت ہے۔ آئیے ان علاقوں کی نشاندہی کریں اور قانون بنائیں کہ وہاں کوئی تعمیرات نہ ہوں۔ اسی کو ڈچ لوگ "دریا کے لیے جگہ" پروگرام کہتے ہیں۔ اس سے سیلابی پانی کو کسی کو نقصان پہنچائے بغیر گزرنے کا محفوظ راستہ مل جاتا ہے۔\n\n۲۔ قدرتی ڈھال کے طور پر درخت لگائیں\n\nجب پہاڑوں پر شدید بارش ہوتی ہے، تو پانی تیزی سے نیچے آتا ہے اور ہمیں سیلاب میں ڈبو دیتا ہے کیونکہ اسے روکنے کے لیے کافی درخت نہیں ہیں۔\n\nکرنا کیا ہے؟ ہمیں ایک بہت بڑی شجرکاری مہم کی ضرورت ہے۔ ہمیں پہاڑوں پر اور اپنے دریاؤں کے کناروں پر سرسبز پٹیاں بنانی چاہئیں۔ درخت اسپنج کی طرح پانی جذب کرتے ہیں اور ان کی جڑیں مٹی کو تھامے رکھتی ہیں، جس سے لینڈ سلائیڈنگ اور اچانک آنے والے سیلاب کو کم کرنے میں مدد ملتی ہے۔\n\n۳۔ ہمارے بند نالوں کو ٹھیک کریں\n\nہمارے شہروں کے نالے پرانے، کچرے سے بھرے ہوئے ہیں اور تیز بارش کا پانی نہیں سنبھال سکتے۔ اسی وجہ سے ہماری گلیاں دریا بن جاتی ہیں۔\n\nکرنا کیا ہے؟ ہمیں اپنے نکاسی آب کے نظام کو صاف اور بہتر بنانے کی ضرورت ہے۔ ہم اپنے شہروں میں مزید پارک اور سرسبز جگہیں بنا سکتے ہیں جو بارش کا پانی جذب کر سکیں۔ یہ ہماری سڑکوں کو ڈوبنے دینے سے کہیں زیادہ بہتر ہے۔\n\n۴۔ مستقبل کی بارشوں کے لیے تیار رہیں\n\nہم جانتے ہیں کہ موسمیاتی تبدیلی کا مطلب ہے کہ مستقبل میں موسم مزید شدید ہوگا۔ ہمیں اس کے لیے تیار رہنا ہوگا۔\n\nکرنا کیا ہے؟ ہمارے پاس ایک بہترین قبل از وقت اطلاع دینے والا نظام ہونا چاہیے۔ لوگوں کو اپنے فون پر بروقت الرٹ ملنا چاہیے تاکہ وہ محفوظ مقام پر منتقل ہو سکیں۔ ہمیں مضبوط سڑکیں اور پل بھی بنانے چاہئیں جو سیلاب کا مقابلہ کر سکیں۔\n\nنیدرلینڈز سمندر کو کیسے شکست دیتا ہے، یہ جاننے کے لیے یہ دو ویڈیوز دیکھیں:\nhttps://www.youtube.com/watch?v=XoEZvSl5Cg8\nhttps://www.youtube.com/watch?v=C7vx4AKRACQ\n\nمختصراً، یہ کوئی فوری حل نہیں ہے۔ یہ ایک طویل مدتی منصوبہ ہے جس کے لیے حکومت کی سنجیدہ کوشش اور ہم شہریوں کے تعاون کی ضرورت ہے۔ اگر ڈچ لوگ اپنے ملک کو سمندر سے بچا سکتے ہیں، تو ہم بھی یقیناً اپنے دریاؤں کے ساتھ محفوظ طریقے سے رہنا سیکھ سکتے ہیں۔\n\n',
      author_id: user2.id,
      status: 'under_review',
      vote_count: 0,
      support_percentage: 0.0,
    },
    });
  const proposal2 = await prisma.proposal.upsert({
    where: {
      title: 'Tes',
    },
    update: {},
    create: {
      process_id: process1.id,
      title: 'Tes',
      title_ur: 'Tes',
      description: 'Test',
      description_ur: 'Test',
      author_id: user2.id,
      status: 'under_review',
      vote_count: 0,
      support_percentage: 0.0,
    },
    });
  const proposal3 = await prisma.proposal.upsert({
    where: {
      title: 'Emergency Reforestation of Swat Valley - Plant 10 Million Trees in 2 Years',
    },
    update: {},
    create: {
      process_id: process1.id,
      title: 'Emergency Reforestation of Swat Valley - Plant 10 Million Trees in 2 Years',
      title_ur:
        'سوات ویلی کی ایمرجنسی جنگلات کی بحالی - 2 سال میں 1 کروڑ درخت لگانا',
      description:
        'The devastating floods in Khyber Pakhtunkhwa that killed over 300 people were worsened by decades of deforestation in Swat Valley. Scientific evidence shows that vegetation naturally reduces flood risk by absorbing precipitation - every time we remove trees, we increase flood danger.\n\nPROPOSAL: Launch an emergency reforestation program to plant 10 million native trees across Swat Valley within 24 months.\n\nIMPLEMENTATION PLAN:\n1. Identify 50,000 hectares of deforested land using satellite mapping\n2. Partner with local communities - pay villagers PKR 50 per tree planted and maintained\n3. Plant native species: Deodar, Pine, Oak, and Walnut trees that are flood-resistant\n4. Create 200 community nurseries with 50,000 seedlings each\n5. Use mobile apps to track tree survival rates and GPS locations\n6. Employ 5,000 local youth as "Tree Guards" with monthly stipends\n\nSCIENTIFIC IMPACT:\n- Trees can reduce surface water runoff by 40-60%\n- Root systems prevent soil erosion and landslides\n- Forest canopy intercepts rainfall before it reaches the ground\n- One mature tree can absorb 2,000 liters of water per day\n\nECONOMIC BENEFITS:\n- Create 25,000 green jobs in rural areas\n- Boost eco-tourism once forests recover\n- Prevent billions in flood damage costs\n- Generate sustainable timber revenue after 15-20 years\n\nCOMMUNITY INVOLVEMENT:\n- Train local farmers in modern forestry techniques\n- Establish village-level forest committees\n- Include women and marginalized communities in tree-planting initiatives\n- Connect with schools for environmental education\n\nMONITORING & ACCOUNTABILITY:\n- Quarterly satellite monitoring of forest cover\n- Community-based monitoring with smartphone apps\n- Annual third-party forest health assessments\n- Transparent public dashboard showing tree survival rates\n\nBUDGET ESTIMATE: PKR 5 billion over 2 years\n- Seedlings & planting: PKR 2 billion\n- Community wages: PKR 1.5 billion  \n- Monitoring systems: PKR 500 million\n- Training & equipment: PKR 1 billion\n\nThis is not just about trees - it is about saving Pakistani lives. Every tree we plant today could prevent deaths in future floods. The people of Swat deserve to live without fear of their mountains washing away their homes.',
      description_ur:
        'خیبر پختونخوا میں 300 سے زیادہ افراد کی ہلاکت کا باعث بننے والے تباہ کن سیلاب سوات ویلی میں کئی دہائیوں کی جنگلات کی کٹائی کی وجہ سے بدتر ہوئے۔ سائنسی شواہد بتاتے ہیں کہ پودے قدرتی طور پر بارش کو جذب کر کے سیلاب کا خطرہ کم کرتے ہیں - جب بھی ہم درخت کاٹتے ہیں، ہم سیلاب کا خطرہ بڑھاتے ہیں۔\n\nتجویز: سوات ویلی میں 24 ماہ کے اندر 1 کروڑ مقامی درخت لگانے کے لیے ایمرجنسی جنگلات کی بحالی کا پروگرام شروع کریں۔\n\nعملی منصوبہ:\n1. سیٹلائٹ میپنگ استعمال کرتے ہوئے 50,000 ہیکٹر جنگلات سے صاف زمین کی شناخت\n2. مقامی کمیونٹیز کے ساتھ شراکت - گاؤں والوں کو ہر درخت لگانے اور برقرار رکھنے کے لیے 50 روپے ادا کریں\n3. مقامی اقسام لگائیں: دیودار، چیڑ، بلوط، اور اخروٹ کے درخت جو سیلاب سے محفوظ ہیں\n4. 50,000 پودوں والی 200 کمیونٹی نرسریاں بنائیں\n5. درختوں کی بقا کی شرح اور GPS مقامات کو ٹریک کرنے کے لیے موبائل ایپس استعمال کریں\n6. ماہانہ وظائف کے ساتھ 5,000 مقامی نوجوانوں کو "ٹری گارڈز" کے طور پر ملازمت دیں\n\nسائنسی اثرات:\n- درخت سطحی پانی کے بہاؤ کو 40-60% تک کم کر سکتے ہیں\n- جڑوں کا نظام مٹی کے کٹاؤ اور لینڈ سلائیڈ کو روکتا ہے\n- جنگل کی چھت بارش کو زمین تک پہنچنے سے پہلے روک لیتی ہے\n- ایک بالغ درخت روزانہ 2,000 لیٹر پانی جذب کر سکتا ہے\n\nمعاشی فوائد:\n- دیہی علاقوں میں 25,000 سبز ملازمتیں پیدا کریں\n- جنگلات کی بحالی کے بعد ماحولیاتی سیاحت کو فروغ دیں\n- سیلاب کے نقصان کی اربوں کی لاگت سے بچیں\n- 15-20 سال بعد پائیدار لکڑی کی آمدنی پیدا کریں\n\nکمیونٹی کی شمولیت:\n- مقامی کسانوں کو جدید جنگلات کی تکنیکوں کی تربیت دیں\n- گاؤں کی سطح پر جنگلاتی کمیٹیاں قائم کریں\n- خواتین اور پسماندہ کمیونٹیز کو درخت لگانے کی مہموں میں شامل کریں\n- ماحولیاتی تعلیم کے لیے اسکولوں سے رابطہ کریں\n\nنگرانی اور احتساب:\n- جنگلاتی احاطے کی سہ ماہی سیٹلائٹ نگرانی\n- اسمارٹ فون ایپس کے ساتھ کمیونٹی پر مبنی نگرانی\n- سالانہ تیسرے فریق کی جنگلاتی صحت کی تشخیص\n- درختوں کی بقا کی شرح دکھانے والا شفاف عوامی ڈیش بورڈ\n\nبجٹ تخمینہ: 2 سال میں 5 ارب روپے\n- پودے اور لگانا: 2 ارب روپے\n- کمیونٹی اجرت: 1.5 ارب روپے\n- نگرانی کے نظام: 50 کروڑ روپے\n- تربیت اور آلات: 1 ارب روپے\n\nیہ صرف درختوں کے بارے میں نہیں - یہ پاکستانی زندگیوں کو بچانے کے بارے میں ہے۔ آج ہم جو بھی درخت لگاتے ہیں وہ مستقبل کے سیلابوں میں موت کو روک سکتا ہے۔ سوات کے لوگ اس ڈر کے بغیر زندگی گزارنے کے حقدار ہیں کہ ان کے پہاڑ ان کے گھروں کو بہا لے جائیں گے۔',
      author_id: user1.id,
      status: 'approved',
      vote_count: 0,
      support_percentage: 0.0,
    },
  });

  console.log('✅ Development data seeded');
}
