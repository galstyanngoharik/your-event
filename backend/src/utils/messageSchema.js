module.exports=async db=>{
  await db.query(`ALTER TABLE "Messages"
    ADD COLUMN IF NOT EXISTS "attachmentKey" VARCHAR(64),
    ADD COLUMN IF NOT EXISTS "attachmentName" VARCHAR(200),
    ADD COLUMN IF NOT EXISTS "attachmentMime" VARCHAR(32),
    ADD COLUMN IF NOT EXISTS "attachmentSize" INTEGER,
    ADD COLUMN IF NOT EXISTS "attachmentDuration" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE`);
};
