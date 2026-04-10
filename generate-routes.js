const fs = require('fs');
const path = require('path');

const generateRouteFile = (modelName, apiBasePath) => {
  const modelNameLowerCase = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  
  const basePath = path.join(__dirname, 'next-app', 'src', 'app', 'api', apiBasePath);
  const idPath = path.join(basePath, '[id]');
  
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
  if (!fs.existsSync(idPath)) fs.mkdirSync(idPath, { recursive: true });

  const routeContent = [
    "import { NextRequest, NextResponse } from 'next/server';",
    "import { prisma } from '@/lib/prisma';",
    "",
    "export async function GET() {",
    "  try {",
    "    const data = await prisma." + modelNameLowerCase + ".findMany({",
    "      orderBy: { createdAt: 'desc' }",
    "    });",
    "    return NextResponse.json({ status: 'success', data });",
    "  } catch (error) {",
    "    return NextResponse.json({ status: 'error', message: 'Failed to fetch' }, { status: 500 });",
    "  }",
    "}",
    "",
    "export async function POST(req: NextRequest) {",
    "  try {",
    "    const body = await req.json();",
    "    const data = await prisma." + modelNameLowerCase + ".create({",
    "      data: body,",
    "    });",
    "    return NextResponse.json({ status: 'success', data }, { status: 201 });",
    "  } catch (error) {",
    "    return NextResponse.json({ status: 'error', message: 'Failed to create' }, { status: 500 });",
    "  }",
    "}"
  ].join("\n");

  const routeIdContent = [
    "import { NextRequest, NextResponse } from 'next/server';",
    "import { prisma } from '@/lib/prisma';",
    "",
    "type Props = {",
    "  params: Promise<{ id: string }>",
    "}",
    "",
    "export async function GET(req: NextRequest, { params }: Props) {",
    "  try {",
    "    const { id } = await params;",
    "    const data = await prisma." + modelNameLowerCase + ".findUnique({",
    "      where: { id: parseInt(id) },",
    "    });",
    "    if (!data) return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });",
    "    return NextResponse.json({ status: 'success', data });",
    "  } catch (error) {",
    "    return NextResponse.json({ status: 'error', message: 'Failed to fetch' }, { status: 500 });",
    "  }",
    "}",
    "",
    "export async function PUT(req: NextRequest, { params }: Props) {",
    "  try {",
    "    const { id } = await params;",
    "    const body = await req.json();",
    "    const data = await prisma." + modelNameLowerCase + ".update({",
    "      where: { id: parseInt(id) },",
    "      data: body,",
    "    });",
    "    return NextResponse.json({ status: 'success', data });",
    "  } catch (error) {",
    "    return NextResponse.json({ status: 'error', message: 'Failed to update' }, { status: 500 });",
    "  }",
    "}",
    "",
    "export async function DELETE(req: NextRequest, { params }: Props) {",
    "  try {",
    "    const { id } = await params;",
    "    await prisma." + modelNameLowerCase + ".delete({",
    "      where: { id: parseInt(id) },",
    "    });",
    "    return NextResponse.json({ status: 'success', message: 'Deleted' });",
    "  } catch (error) {",
    "    return NextResponse.json({ status: 'error', message: 'Failed to delete' }, { status: 500 });",
    "  }",
    "}"
  ].join("\n");

  fs.writeFileSync(path.join(basePath, 'route.ts'), routeContent);
  fs.writeFileSync(path.join(idPath, 'route.ts'), routeIdContent);
  console.log("Generated " + apiBasePath);
};

generateRouteFile('contact', 'contact');
generateRouteFile('socialMedia', 'social-media');
generateRouteFile('message', 'message');
generateRouteFile('moment', 'moment');
generateRouteFile('travelCity', 'travel-cities');
generateRouteFile('travelFootprint', 'travel-footprints');
generateRouteFile('education', 'education');
generateRouteFile('experience', 'experience');
generateRouteFile('skill', 'skill');
generateRouteFile('project', 'project');
generateRouteFile('music', 'music');
generateRouteFile('movie', 'movie');
generateRouteFile('siteConfig', 'site-config');
generateRouteFile('danmaku', 'danmaku');
