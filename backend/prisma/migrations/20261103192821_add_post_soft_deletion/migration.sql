-- AlterTable
ALTER TABLE "DiscussionPost" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" UUID,
ADD COLUMN     "deletedReason" TEXT;

-- CreateIndex
CREATE INDEX "DiscussionPost_deletedAt_createdAt_idx" ON "DiscussionPost"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "DiscussionPost_deletedById_idx" ON "DiscussionPost"("deletedById");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Report_targetGroupId_idx" ON "Report"("targetGroupId");

-- CreateIndex
CREATE INDEX "Report_targetPostId_idx" ON "Report"("targetPostId");

-- CreateIndex
CREATE INDEX "Report_targetCommentId_idx" ON "Report"("targetCommentId");

-- AddForeignKey
ALTER TABLE "DiscussionPost" ADD CONSTRAINT "DiscussionPost_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
