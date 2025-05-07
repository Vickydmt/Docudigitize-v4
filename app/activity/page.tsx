"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, FileText, Upload, Languages, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface ActivityItem {
  id: string
  type: string
  description: string
  date: string
  documentId?: string
  documentName?: string
}

export default function ActivityPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(userLoggedIn)

    if (!userLoggedIn) {
      router.push("/login")
      return
    }

    // Fetch real activity data from localStorage or an API
    const fetchActivities = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll get activities from localStorage if they exist
        const storedActivities = localStorage.getItem("userActivities")

        if (storedActivities) {
          setActivities(JSON.parse(storedActivities))
        } else {
          // If no activities exist yet, create an initial login activity
          const initialActivity = {
            id: `act-${Date.now()}`,
            type: "login",
            description: "Logged in to account",
            date: new Date().toISOString(),
          }

          const newActivities = [initialActivity]
          localStorage.setItem("userActivities", JSON.stringify(newActivities))
          setActivities(newActivities)
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [router])

  // Function to log a new activity
  const logActivity = (type: string, description: string, documentId?: string, documentName?: string) => {
    const newActivity = {
      id: `act-${Date.now()}`,
      type,
      description,
      date: new Date().toISOString(),
      documentId,
      documentName,
    }

    const updatedActivities = [newActivity, ...activities]
    localStorage.setItem("userActivities", JSON.stringify(updatedActivities))
    setActivities(updatedActivities)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "upload":
        return <Upload className="h-5 w-5 text-green-500" />
      case "process":
        return <FileText className="h-5 w-5 text-amber-500" />
      case "translate":
        return <Languages className="h-5 w-5 text-purple-500" />
      case "download":
        return <Download className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null // Will redirect to login
  }

  return (
    <motion.div
      className="container mx-auto py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Activity Log</h1>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="logins">Logins</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        className="flex"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mr-4 mt-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(activity.date)}
                            {activity.documentId && (
                              <Link
                                href={`/documents/${activity.documentId}`}
                                className="ml-4 text-primary hover:underline flex items-center"
                              >
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                {activity.documentName}
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No activity recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Activity</CardTitle>
                <CardDescription>Actions related to your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {activities.filter((a) => ["process", "translate", "download"].includes(a.type)).length > 0 ? (
                    activities
                      .filter((a) => ["process", "translate", "download"].includes(a.type))
                      .map((activity) => (
                        <motion.div
                          key={activity.id}
                          className="flex"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="mr-4 mt-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{activity.description}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {formatDate(activity.date)}
                              {activity.documentId && (
                                <Link
                                  href={`/documents/${activity.documentId}`}
                                  className="ml-4 text-primary hover:underline flex items-center"
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  {activity.documentName}
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No document activity recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploads">
            <Card>
              <CardHeader>
                <CardTitle>Upload Activity</CardTitle>
                <CardDescription>Document uploads and imports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {activities.filter((a) => a.type === "upload").length > 0 ? (
                    activities
                      .filter((a) => a.type === "upload")
                      .map((activity) => (
                        <motion.div
                          key={activity.id}
                          className="flex"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="mr-4 mt-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{activity.description}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {formatDate(activity.date)}
                              {activity.documentId && (
                                <Link
                                  href={`/documents/${activity.documentId}`}
                                  className="ml-4 text-primary hover:underline flex items-center"
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  {activity.documentName}
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No upload activity recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logins">
            <Card>
              <CardHeader>
                <CardTitle>Login Activity</CardTitle>
                <CardDescription>Recent account logins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {activities.filter((a) => a.type === "login").length > 0 ? (
                    activities
                      .filter((a) => a.type === "login")
                      .map((activity) => (
                        <motion.div
                          key={activity.id}
                          className="flex"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="mr-4 mt-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{activity.description}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {formatDate(activity.date)}
                            </div>
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No login activity recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}
