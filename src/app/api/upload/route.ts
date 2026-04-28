import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier n'est joint" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${extension}`
    const path = join(process.cwd(), "public", "uploads", fileName)

    await writeFile(path, buffer)
    const url = `/uploads/${fileName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}
