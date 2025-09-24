import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import { registerFormSchema } from '@/lib/forms';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  console.log('[INFO] Inside register route');
  try {
    const rawData = await request.json();
    const result = registerFormSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { full_name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          "error": "User with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: full_name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: 'User registered successfully', userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fieldErrors: {} },
      { status: 500 }
    );
  }
}
