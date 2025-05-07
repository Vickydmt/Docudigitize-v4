"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Settings, Clock, User, LogOut } from "lucide-react"
import { getUserDocumentsAction } from "@/lib/document-actions"
import type { Document } from "@/lib/mock-data-service"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [recentActivity, setRecentActivity] = useState<{ date: string; action: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(userLoggedIn)

    // Get user info from localStorage
    const userInfo = localStorage.getItem("user")
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }

    if (!userLoggedIn) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        if (user?.id) {
          // Fetch recent documents
          const docs = await getUserDocumentsAction(user.id)
          setRecentDocuments(docs.slice(0, 3)) // Get only the 3 most recent

          // Create mock recent activity
          setRecentActivity([
            { date: new Date().toISOString(), action: "Logged in" },
            { date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), action: "Uploaded document" },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), action: "Translated document" },
          ])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, user?.id])

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false")
    localStorage.removeItem("user")
    router.push("/login")
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

  return (
    <motion.div
      className="container mx-auto py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-2 md:mb-0">Dashboard</h1>
          {user && (
            <div className="flex items-center bg-muted/50 p-2 rounded-lg">
              <User className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium mr-2">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8">
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-xs">Logout</span>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Documents</CardTitle>
                <CardDescription>You have {recentDocuments.length} documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/documents">View All</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Upload Document</CardTitle>
                <CardDescription>Digitize a new document</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Account Settings</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Last login: Today</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/activity">
                    <Clock className="mr-2 h-4 w-4" />
                    View Activity
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Your recently processed documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc) => (
                      <motion.div
                        key={doc._id}
                        className="flex items-center p-3 border rounded-lg"
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--card), 0.05)" }}
                      >
                        <FileText className="h-10 w-10 text-muted-foreground mr-4" />
                        <div className="flex-1">
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Processed on {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/documents/${doc._id}`}>View</Link>
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No documents yet</p>
                      <Button variant="link" asChild className="mt-2">
                        <Link href="/upload">Upload your first document</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="relative mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        {index < recentActivity.length - 1 && (
                          <div className="absolute top-2 bottom-0 left-1 w-px bg-border h-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
