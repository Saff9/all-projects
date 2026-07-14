import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ============================================
  // Create Admin User
  // ============================================
  console.log('Creating admin user...');
  
  const adminPassword = await bcrypt.hash('saffanakbar942@gmail.com', 12);
  
  await prisma.user.upsert({
    where: { email: 'saffanakbar942@gmail.com' },
    update: {},
    create: {
      email: 'saffanakbar942@gmail.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
      emailVerifiedAt: new Date(),
    },
  });
  console.log('Admin user created: saffanakbar942@gmail.com');

  // ============================================
  // Create Subjects
  // ============================================
  console.log('Creating subjects...');

  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { slug: 'physics' },
      update: {},
      create: {
        name: 'Physics',
        slug: 'physics',
        description: 'Study of matter, energy, and their interactions',
        colorCode: '#3B82F6',
        displayOrder: 1,
        forNeet: true,
        forJeeMain: true,
        forJeeAdvanced: true,
      },
    }),
    prisma.subject.upsert({
      where: { slug: 'chemistry' },
      update: {},
      create: {
        name: 'Chemistry',
        slug: 'chemistry',
        description: 'Study of substances, their properties, and reactions',
        colorCode: '#10B981',
        displayOrder: 2,
        forNeet: true,
        forJeeMain: true,
        forJeeAdvanced: true,
      },
    }),
    prisma.subject.upsert({
      where: { slug: 'biology' },
      update: {},
      create: {
        name: 'Biology',
        slug: 'biology',
        description: 'Study of living organisms and life processes',
        colorCode: '#8B5CF6',
        displayOrder: 3,
        forNeet: true,
        forJeeMain: false,
        forJeeAdvanced: false,
      },
    }),
    prisma.subject.upsert({
      where: { slug: 'mathematics' },
      update: {},
      create: {
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'Study of numbers, quantities, and shapes',
        colorCode: '#F59E0B',
        displayOrder: 4,
        forNeet: false,
        forJeeMain: true,
        forJeeAdvanced: true,
      },
    }),
  ]);

  console.log(`Created ${subjects.length} subjects`);

  // ============================================
  // Create Chapters for Physics
  // ============================================
  console.log('Creating chapters...');

  const physicsChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[0].id, slug: 'mechanics' } },
      update: {},
      create: {
        subjectId: subjects[0].id,
        name: 'Mechanics',
        slug: 'mechanics',
        description: 'Study of motion, forces, and energy',
        classLevel: [11],
        unitNumber: 1,
        chapterNumber: 1,
        neetWeightage: 15.5,
        jeeMainWeightage: 18.0,
        jeeAdvancedWeightage: 20.0,
        difficultyLevel: 'medium',
        displayOrder: 1,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[0].id, slug: 'thermodynamics' } },
      update: {},
      create: {
        subjectId: subjects[0].id,
        name: 'Thermodynamics',
        slug: 'thermodynamics',
        description: 'Study of heat and temperature and their relation to energy',
        classLevel: [11],
        unitNumber: 2,
        chapterNumber: 2,
        neetWeightage: 10.0,
        jeeMainWeightage: 12.0,
        jeeAdvancedWeightage: 15.0,
        difficultyLevel: 'hard',
        displayOrder: 2,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[0].id, slug: 'electromagnetism' } },
      update: {},
      create: {
        subjectId: subjects[0].id,
        name: 'Electromagnetism',
        slug: 'electromagnetism',
        description: 'Study of electromagnetic force and fields',
        classLevel: [12],
        unitNumber: 1,
        chapterNumber: 3,
        neetWeightage: 18.0,
        jeeMainWeightage: 20.0,
        jeeAdvancedWeightage: 22.0,
        difficultyLevel: 'hard',
        displayOrder: 3,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[0].id, slug: 'optics' } },
      update: {},
      create: {
        subjectId: subjects[0].id,
        name: 'Optics',
        slug: 'optics',
        description: 'Study of light and its behavior',
        classLevel: [12],
        unitNumber: 2,
        chapterNumber: 4,
        neetWeightage: 8.0,
        jeeMainWeightage: 10.0,
        jeeAdvancedWeightage: 8.0,
        difficultyLevel: 'medium',
        displayOrder: 4,
      },
    }),
  ]);

  // Create chapters for Chemistry
  const chemistryChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[1].id, slug: 'physical-chemistry' } },
      update: {},
      create: {
        subjectId: subjects[1].id,
        name: 'Physical Chemistry',
        slug: 'physical-chemistry',
        description: 'Study of chemical reactions and physical properties',
        classLevel: [11],
        unitNumber: 1,
        chapterNumber: 1,
        neetWeightage: 12.0,
        jeeMainWeightage: 15.0,
        jeeAdvancedWeightage: 18.0,
        difficultyLevel: 'medium',
        displayOrder: 1,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[1].id, slug: 'organic-chemistry' } },
      update: {},
      create: {
        subjectId: subjects[1].id,
        name: 'Organic Chemistry',
        slug: 'organic-chemistry',
        description: 'Study of carbon compounds',
        classLevel: [11, 12],
        unitNumber: 2,
        chapterNumber: 2,
        neetWeightage: 15.0,
        jeeMainWeightage: 18.0,
        jeeAdvancedWeightage: 20.0,
        difficultyLevel: 'hard',
        displayOrder: 2,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[1].id, slug: 'inorganic-chemistry' } },
      update: {},
      create: {
        subjectId: subjects[1].id,
        name: 'Inorganic Chemistry',
        slug: 'inorganic-chemistry',
        description: 'Study of inorganic compounds and elements',
        classLevel: [11, 12],
        unitNumber: 3,
        chapterNumber: 3,
        neetWeightage: 13.0,
        jeeMainWeightage: 12.0,
        jeeAdvancedWeightage: 12.0,
        difficultyLevel: 'medium',
        displayOrder: 3,
      },
    }),
  ]);

  // Create chapters for Biology
  const biologyChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[2].id, slug: 'botany' } },
      update: {},
      create: {
        subjectId: subjects[2].id,
        name: 'Botany',
        slug: 'botany',
        description: 'Study of plant life',
        classLevel: [11, 12],
        unitNumber: 1,
        chapterNumber: 1,
        neetWeightage: 25.0,
        difficultyLevel: 'medium',
        displayOrder: 1,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[2].id, slug: 'zoology' } },
      update: {},
      create: {
        subjectId: subjects[2].id,
        name: 'Zoology',
        slug: 'zoology',
        description: 'Study of animal life',
        classLevel: [11, 12],
        unitNumber: 2,
        chapterNumber: 2,
        neetWeightage: 25.0,
        difficultyLevel: 'medium',
        displayOrder: 2,
      },
    }),
  ]);

  // Create chapters for Mathematics
  const mathChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[3].id, slug: 'calculus' } },
      update: {},
      create: {
        subjectId: subjects[3].id,
        name: 'Calculus',
        slug: 'calculus',
        description: 'Study of continuous change',
        classLevel: [11, 12],
        unitNumber: 1,
        chapterNumber: 1,
        jeeMainWeightage: 25.0,
        jeeAdvancedWeightage: 28.0,
        difficultyLevel: 'hard',
        displayOrder: 1,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[3].id, slug: 'algebra' } },
      update: {},
      create: {
        subjectId: subjects[3].id,
        name: 'Algebra',
        slug: 'algebra',
        description: 'Study of mathematical symbols and rules',
        classLevel: [11, 12],
        unitNumber: 2,
        chapterNumber: 2,
        jeeMainWeightage: 20.0,
        jeeAdvancedWeightage: 18.0,
        difficultyLevel: 'medium',
        displayOrder: 2,
      },
    }),
    prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subjects[3].id, slug: 'coordinate-geometry' } },
      update: {},
      create: {
        subjectId: subjects[3].id,
        name: 'Coordinate Geometry',
        slug: 'coordinate-geometry',
        description: 'Study of geometry using coordinates',
        classLevel: [11, 12],
        unitNumber: 3,
        chapterNumber: 3,
        jeeMainWeightage: 18.0,
        jeeAdvancedWeightage: 16.0,
        difficultyLevel: 'medium',
        displayOrder: 3,
      },
    }),
  ]);

  const allChapters = [
    ...physicsChapters,
    ...chemistryChapters,
    ...biologyChapters,
    ...mathChapters,
  ];

  console.log(`Created ${allChapters.length} chapters`);

  // ============================================
  // Create Sample Questions
  // ============================================
  console.log('Creating sample questions...');

  // Physics Questions
  const physicsQuestions = await Promise.all([
    // Mechanics Question
    prisma.question.create({
      data: {
        subjectId: subjects[0].id,
        chapterId: physicsChapters[0].id,
        questionText: 'A particle moves in a straight line with constant acceleration. If it covers distances of 10m and 20m in consecutive seconds, what is its initial velocity?',
        questionType: 'mcq',
        difficultyLevel: 'medium',
        sourceType: 'pyq',
        sourceExam: 'JEE_MAIN',
        sourceYear: 2023,
        forNeet: true,
        forJeeMain: true,
        forJeeAdvanced: true,
        solutionText: 'Using kinematic equations, we can solve for initial velocity. Let u be initial velocity and a be acceleration. In first second: s1 = u + a/2 = 10. In second second: s2 = u + 3a/2 = 20. Solving: a = 10 m/s², u = 5 m/s.',
        options: {
          create: [
            { optionLabel: 'A', optionText: '5 m/s', isCorrect: true, displayOrder: 1 },
            { optionLabel: 'B', optionText: '10 m/s', isCorrect: false, displayOrder: 2 },
            { optionLabel: 'C', optionText: '15 m/s', isCorrect: false, displayOrder: 3 },
            { optionLabel: 'D', optionText: '20 m/s', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
    // Thermodynamics Question
    prisma.question.create({
      data: {
        subjectId: subjects[0].id,
        chapterId: physicsChapters[1].id,
        questionText: 'In an isothermal process, the internal energy of an ideal gas:',
        questionType: 'mcq',
        difficultyLevel: 'easy',
        sourceType: 'ncert',
        forNeet: true,
        forJeeMain: true,
        forJeeAdvanced: true,
        solutionText: 'In an isothermal process, temperature remains constant. For an ideal gas, internal energy depends only on temperature, so internal energy remains constant.',
        options: {
          create: [
            { optionLabel: 'A', optionText: 'Increases', isCorrect: false, displayOrder: 1 },
            { optionLabel: 'B', optionText: 'Decreases', isCorrect: false, displayOrder: 2 },
            { optionLabel: 'C', optionText: 'Remains constant', isCorrect: true, displayOrder: 3 },
            { optionLabel: 'D', optionText: 'First increases then decreases', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
    // Electromagnetism Question
    prisma.question.create({
      data: {
        subjectId: subjects[0].id,
        chapterId: physicsChapters[2].id,
        questionText: 'The magnetic field at the center of a circular coil of radius R carrying current I is:',
        questionType: 'mcq',
        difficultyLevel: 'medium',
        sourceType: 'pyq',
        sourceExam: 'NEET',
        sourceYear: 2022,
        forNeet: true,
        forJeeMain: true,
        forJeeAdvanced: true,
        solutionText: 'Using Biot-Savart law, B = (µ0I)/(2R) at the center of a circular coil.',
        options: {
          create: [
            { optionLabel: 'A', optionText: 'µ0I/2R', isCorrect: true, displayOrder: 1 },
            { optionLabel: 'B', optionText: 'µ0I/R', isCorrect: false, displayOrder: 2 },
            { optionLabel: 'C', optionText: 'µ0I/4R', isCorrect: false, displayOrder: 3 },
            { optionLabel: 'D', optionText: '2µ0I/R', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
  ]);

  // Chemistry Questions
  const chemistryQuestions = await Promise.all([
    // Physical Chemistry Question
    prisma.question.create({
      data: {
        subjectId: subjects[1].id,
        chapterId: chemistryChapters[0].id,
        questionText: 'The rate constant of a first-order reaction is 2.0 × 10^-2 s^-1. The half-life of the reaction is:',
        questionType: 'mcq',
        difficultyLevel: 'easy',
        sourceType: 'pyq',
        sourceExam: 'NEET',
        sourceYear: 2023,
        forNeet: true,
        forJeeMain: true,
        forJeeAdvanced: true,
        solutionText: 'For a first-order reaction, t1/2 = 0.693/k = 0.693/(2.0 × 10^-2) = 34.65 s',
        options: {
          create: [
            { optionLabel: 'A', optionText: '34.65 s', isCorrect: true, displayOrder: 1 },
            { optionLabel: 'B', optionText: '17.32 s', isCorrect: false, displayOrder: 2 },
            { optionLabel: 'C', optionText: '69.30 s', isCorrect: false, displayOrder: 3 },
            { optionLabel: 'D', optionText: '3.46 s', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
    // Organic Chemistry Question
    prisma.question.create({
      data: {
        subjectId: subjects[1].id,
        chapterId: chemistryChapters[1].id,
        questionText: 'Which of the following is most reactive towards SN1 reaction?',
        questionType: 'mcq',
        difficultyLevel: 'medium',
        sourceType: 'pyq',
        sourceExam: 'JEE_MAIN',
        sourceYear: 2022,
        forNeet: true,
        forJeeMain: true,
        forJeeAdvanced: true,
        solutionText: 'SN1 reactions proceed via carbocation formation. Tertiary alkyl halides form the most stable carbocations and are most reactive in SN1 reactions.',
        options: {
          create: [
            { optionLabel: 'A', optionText: 'CH3Cl', isCorrect: false, displayOrder: 1 },
            { optionLabel: 'B', optionText: 'C2H5Cl', isCorrect: false, displayOrder: 2 },
            { optionLabel: 'C', optionText: '(CH3)3CCl', isCorrect: true, displayOrder: 3 },
            { optionLabel: 'D', optionText: '(CH3)2CHCl', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
  ]);

  // Biology Questions
  const biologyQuestions = await Promise.all([
    prisma.question.create({
      data: {
        subjectId: subjects[2].id,
        chapterId: biologyChapters[0].id,
        questionText: 'Which organelle is responsible for photosynthesis in plant cells?',
        questionType: 'mcq',
        difficultyLevel: 'easy',
        sourceType: 'ncert',
        forNeet: true,
        forJeeMain: false,
        forJeeAdvanced: false,
        solutionText: 'Chloroplasts are the organelles responsible for photosynthesis in plant cells. They contain chlorophyll and other pigments that capture light energy.',
        options: {
          create: [
            { optionLabel: 'A', optionText: 'Mitochondria', isCorrect: false, displayOrder: 1 },
            { optionLabel: 'B', optionText: 'Chloroplast', isCorrect: true, displayOrder: 2 },
            { optionLabel: 'C', optionText: 'Ribosome', isCorrect: false, displayOrder: 3 },
            { optionLabel: 'D', optionText: 'Golgi apparatus', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: subjects[2].id,
        chapterId: biologyChapters[1].id,
        questionText: 'The functional unit of kidney is:',
        questionType: 'mcq',
        difficultyLevel: 'easy',
        sourceType: 'pyq',
        sourceExam: 'NEET',
        sourceYear: 2021,
        forNeet: true,
        forJeeMain: false,
        forJeeAdvanced: false,
        solutionText: 'The nephron is the functional unit of the kidney, responsible for filtering blood and producing urine.',
        options: {
          create: [
            { optionLabel: 'A', optionText: 'Neuron', isCorrect: false, displayOrder: 1 },
            { optionLabel: 'B', optionText: 'Nephron', isCorrect: true, displayOrder: 2 },
            { optionLabel: 'C', optionText: 'Alveolus', isCorrect: false, displayOrder: 3 },
            { optionLabel: 'D', optionText: 'Glomerulus', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
  ]);

  // Mathematics Questions
  const mathQuestions = await Promise.all([
    prisma.question.create({
      data: {
        subjectId: subjects[3].id,
        chapterId: mathChapters[0].id,
        questionText: 'The derivative of sin(x²) with respect to x is:',
        questionType: 'mcq',
        difficultyLevel: 'medium',
        sourceType: 'pyq',
        sourceExam: 'JEE_MAIN',
        sourceYear: 2023,
        forNeet: false,
        forJeeMain: true,
        forJeeAdvanced: true,
        solutionText: 'Using chain rule: d/dx[sin(x²)] = cos(x²) × d/dx(x²) = cos(x²) × 2x = 2x cos(x²)',
        options: {
          create: [
            { optionLabel: 'A', optionText: '2x cos(x²)', isCorrect: true, displayOrder: 1 },
            { optionLabel: 'B', optionText: 'cos(x²)', isCorrect: false, displayOrder: 2 },
            { optionLabel: 'C', optionText: 'x cos(x²)', isCorrect: false, displayOrder: 3 },
            { optionLabel: 'D', optionText: '2 cos(x²)', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: subjects[3].id,
        chapterId: mathChapters[1].id,
        questionText: 'If A is a 3×3 matrix with |A| = 5, then |adj(A)| is:',
        questionType: 'mcq',
        difficultyLevel: 'medium',
        sourceType: 'pyq',
        sourceExam: 'JEE_ADVANCED',
        sourceYear: 2022,
        forNeet: false,
        forJeeMain: true,
        forJeeAdvanced: true,
        solutionText: 'For an n×n matrix A, |adj(A)| = |A|^(n-1). Here n=3, so |adj(A)| = 5^(3-1) = 25',
        options: {
          create: [
            { optionLabel: 'A', optionText: '5', isCorrect: false, displayOrder: 1 },
            { optionLabel: 'B', optionText: '25', isCorrect: true, displayOrder: 2 },
            { optionLabel: 'C', optionText: '125', isCorrect: false, displayOrder: 3 },
            { optionLabel: 'D', optionText: '1/5', isCorrect: false, displayOrder: 4 },
          ],
        },
      },
    }),
  ]);

  const allQuestions = [
    ...physicsQuestions,
    ...chemistryQuestions,
    ...biologyQuestions,
    ...mathQuestions,
  ];

  console.log(`Created ${allQuestions.length} questions`);

  // ============================================
  // Create Sample Test
  // ============================================
  console.log('Creating sample test...');

  const sampleTest = await prisma.test.create({
    data: {
      title: 'NEET 2024 Physics Practice Test',
      slug: 'neet-2024-physics-practice',
      description: 'A practice test covering Physics topics for NEET 2024',
      testType: 'subject_test',
      examType: 'NEET',
      subjectId: subjects[0].id,
      totalQuestions: 3,
      totalMarks: 12,
      durationMinutes: 6,
      markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
      isPublic: true,
      isPremium: false,
      testQuestions: {
        create: physicsQuestions.map((q, index) => ({
          questionId: q.id,
          questionNumber: index + 1,
          marks: 4,
        })),
      },
    },
  });

  console.log(`Created sample test: ${sampleTest.title}`);

  // ============================================
  // Update Chapter Stats
  // ============================================
  console.log('Updating chapter statistics...');

  for (const chapter of allChapters) {
    const questionCount = await prisma.question.count({
      where: { chapterId: chapter.id, isActive: true },
    });

    await prisma.chapter.update({
      where: { id: chapter.id },
      data: { totalQuestions: questionCount },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });