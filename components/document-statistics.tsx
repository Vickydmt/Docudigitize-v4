"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DocumentStatisticsProps {
  content: string
  language: string
}

const COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8B5CF6", "#EC4899"]

export function DocumentStatistics({ content, language }: DocumentStatisticsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [wordSortType, setWordSortType] = useState<"longer" | "shorter" | "frequent">("longer")

  useEffect(() => {
    if (!content) {
      setIsLoading(false)
      return
    }

    // Calculate statistics
    const calculateStats = () => {
      // Character count (including spaces)
      const charCount = content.length

      // Character count (excluding spaces)
      const charCountNoSpaces = content.replace(/\s/g, "").length

      // Word count - handle multilingual text by splitting on whitespace
      // Only count words with 2 or more characters
      const words = content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length >= 2)
      const wordCount = words.length

      // Line count
      const lineCount = (content.match(/\n/g) || []).length + 1

      // Paragraph count (separated by double newlines)
      const paragraphCount = content.split(/\n\s*\n/).filter(Boolean).length || 1

      // Sentence count - handle multilingual text
      // This is a simplified approach that works for many languages
      const sentenceCount = (content.match(/[.!?।॥؟।፨።۔]/g) || []).length || 1

      // Word frequency - create a map of words to their counts
      const wordFrequency: Record<string, number> = {}
      words.forEach((word) => {
        // Normalize the word (lowercase, remove punctuation)
        const normalizedWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        if (normalizedWord && normalizedWord.length >= 2) {
          wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1
        }
      })

      // Calculate unique words
      const uniqueWordCount = Object.keys(wordFrequency).length
      const uniqueWordPercentage = Math.round((uniqueWordCount / wordCount) * 100) || 0

      // Calculate reading time (average 200 words per minute)
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

      // Calculate word length distribution
      const wordLengthDistribution: Record<number, number> = {}
      words.forEach((word) => {
        const length = word.length
        if (length >= 2) {
          // Only count words with 2+ characters
          wordLengthDistribution[length] = (wordLengthDistribution[length] || 0) + 1
        }
      })

      // Convert to array for chart
      const wordLengthData = Object.entries(wordLengthDistribution)
        .map(([length, count]) => ({ length: Number(length), count }))
        .filter((item) => item.length > 0) // Filter out empty words
        .sort((a, b) => a.length - b.length)

      // Document composition data
      const spaces = (content.match(/\s/g) || []).length
      const punctuation = (content.match(/[.,/#!$%^&*;:{}=\-_`~()]/g) || []).length
      const total = charCount

      const compositionData = [
        { name: "Words", value: wordCount, percentage: Math.round((wordCount / total) * 100) },
        { name: "Spaces", value: spaces, percentage: Math.round((spaces / total) * 100) },
        { name: "Punctuation", value: punctuation, percentage: Math.round((punctuation / total) * 100) },
      ]

      return {
        charCount,
        charCountNoSpaces,
        wordCount,
        lineCount,
        sentenceCount,
        paragraphCount,
        readingTimeMinutes,
        uniqueWordCount,
        uniqueWordPercentage,
        wordFrequency,
        wordLengthData,
        compositionData,
      }
    }

    try {
      const documentStats = calculateStats()
      setStats(documentStats)
    } catch (error) {
      console.error("Error calculating document statistics:", error)
    } finally {
      setIsLoading(false)
    }
  }, [content])

  // Function to get top words based on selected sort type
  function getTopWords(count = 5) {
    if (!stats || !stats.wordFrequency) return []

    const entries = Object.entries(stats.wordFrequency)

    let sortedEntries
    switch (wordSortType) {
      case "longer":
        // Sort by length (longer first), then by frequency
        sortedEntries = entries.sort((a, b) => {
          const lengthDiff = b[0].length - a[0].length
          return lengthDiff !== 0 ? lengthDiff : b[1] - a[1]
        })
        break
      case "shorter":
        // Sort by length (shorter first), then by frequency
        sortedEntries = entries.sort((a, b) => {
          const lengthDiff = a[0].length - b[0].length
          return lengthDiff !== 0 ? lengthDiff : b[1] - a[1]
        })
        break
      case "frequent":
        // Sort by frequency only
        sortedEntries = entries.sort((a, b) => b[1] - a[1])
        break
      default:
        sortedEntries = entries.sort((a, b) => b[1] - a[1])
    }

    return sortedEntries.slice(0, count).map(([word, count]) => ({ word, count }))
  }

  // Function to prepare data for the top words pie chart
  function getTopWordsPieData() {
    const topWords = getTopWords(5)
    const total = topWords.reduce((sum, item) => sum + item.count, 0)

    return topWords.map((item, index) => ({
      name: item.word,
      value: item.count,
      percentage: Math.round((item.count / total) * 100),
    }))
  }

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p>{`Count: ${payload[0].value} (${payload[0].payload.percentage}%)`}</p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">No content available for analysis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 justify-center">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="word-analysis">Word Analysis</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Characters</h3>
                <p className="text-3xl font-bold">{stats.charCount.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Words</h3>
                <p className="text-3xl font-bold">{stats.wordCount.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Lines</h3>
                <p className="text-3xl font-bold">{stats.lineCount.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Sentences</h3>
                <p className="text-3xl font-bold">{stats.sentenceCount.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Paragraphs</h3>
                <p className="text-3xl font-bold">{stats.paragraphCount.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Reading Time</h3>
                <p className="text-3xl font-bold">{stats.readingTimeMinutes} min</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Unique Words</h3>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${stats.uniqueWordPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.uniqueWordCount} unique words out of {stats.wordCount} total words
                <span className="float-right">{stats.uniqueWordPercentage}%</span>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="word-analysis">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Top Words</h3>
              <Select
                value={wordSortType}
                onValueChange={(value: "longer" | "shorter" | "frequent") => setWordSortType(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select word priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="longer">Prioritize Longer Words</SelectItem>
                  <SelectItem value="shorter">Prioritize Shorter Words</SelectItem>
                  <SelectItem value="frequent">Prioritize Repeated Words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              {getTopWords(10).map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{item.word}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Word Length Distribution</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.wordLengthData.filter((item: any) => item.length >= 2)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="length" label={{ value: "Word Length", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <div className="flex justify-end mb-6">
              <Select
                value={wordSortType}
                onValueChange={(value: "longer" | "shorter" | "frequent") => setWordSortType(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select word priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="longer">Prioritize Longer Words</SelectItem>
                  <SelectItem value="shorter">Prioritize Shorter Words</SelectItem>
                  <SelectItem value="frequent">Prioritize Repeated Words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-center">Document Composition</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.compositionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.compositionData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-center">Top Words Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTopWordsPieData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getTopWordsPieData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
