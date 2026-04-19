/*
  Warnings:

  - A unique constraint covering the columns `[company_id,first_name,last_name]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contacts_company_name_unique" ON "contacts"("company_id", "first_name", "last_name");
