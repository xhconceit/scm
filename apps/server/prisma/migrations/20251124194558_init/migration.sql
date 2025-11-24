-- CreateTable
CREATE TABLE "SensorData" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "module" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorDataConfig" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorDataConfig_pkey" PRIMARY KEY ("id")
);
