"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Settings2, FileText, AlertTriangle } from "lucide-react"
import type { DocumentSettings } from "@/lib/document-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentSettingsProps {
  settings: DocumentSettings
  onSettingsChange: (settings: DocumentSettings) => void
}

export function DocumentSettings({ settings, onSettingsChange }: DocumentSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateSettings = (key: keyof DocumentSettings, value: any) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    }
    onSettingsChange(updatedSettings)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex w-full justify-between">
          <div className="flex items-center">
            <Settings2 className="mr-2 h-4 w-4" />
            <span>Advanced Processing Settings</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4 border rounded-md p-4">
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Advanced settings are recommended for experienced users only. Changing these settings will affect OCR
            results.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium mb-2">Processing Mode</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant={settings.processingMode === "standard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings("processingMode", "standard")}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Standard Documents
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={settings.processingMode === "historical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings("processingMode", "historical")}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Historical Documents
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Historical mode is optimized for older handwritten documents
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enhance-mode"
                checked={settings.enhanceImage}
                onCheckedChange={(checked) => updateSettings("enhanceImage", checked)}
              />
              <Label htmlFor="enhance-mode">Pre-process image for better OCR results</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Applies contrast enhancement, deskewing, and noise reduction
            </p>
          </div>

          <div>
            <h3 className="text-base font-medium mb-2">OCR Confidence Threshold</h3>
            <div className="space-y-2">
              <Slider
                value={[settings.confidenceThreshold]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => updateSettings("confidenceThreshold", value[0])}
              />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Low accuracy, more text</span>
                <span className="text-sm font-medium">{settings.confidenceThreshold}%</span>
                <span className="text-sm text-muted-foreground">High accuracy, less text</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
