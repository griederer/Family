'use client'

import { ThingsTaskList } from '@/components/tasks/ThingsTaskList'

export default function UpcomingTasksPage() {
  return <ThingsTaskList smartListType="this_week" />
}