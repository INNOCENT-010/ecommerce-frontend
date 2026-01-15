// app/admin/settings/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Save, Bell, CreditCard, Globe, Palette, Shield, Store, Mail, Users, Package, Truck, Eye, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

type SettingsCategory = 'general' | 'payment' | 'notifications' | 'appearance' | 'shipping'

interface Settings {
  // General
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  timezone: string
  storeDescription: string
  
  // Payment
  paystackPublicKey: string
  paystackSecretKey: string
  paystackTestMode: boolean
  paymentMethods: {
    card: boolean
    bankTransfer: boolean
    cashOnDelivery: boolean
  }
  
  // Notifications
  emailNotifications: boolean
  newOrderEmail: string
  lowStockThreshold: number
  notifyOnLowStock: boolean
  notifyOnNewOrder: boolean
  notifyOnOrderUpdate: boolean
  
  // Appearance
  primaryColor: string
  secondaryColor: string
  logoUrl: string
  faviconUrl: string
  theme: 'light' | 'dark' | 'auto'
  
  // Shipping
  shippingEnabled: boolean
  shippingFee: number
  freeShippingThreshold: number
  shippingZones: Array<{
    id: string
    name: string
    countries: string[]
    rate: number
  }>
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general')
  const [settings, setSettings] = useState<Settings>({
    // General
    storeName: 'BLOOM&G Fashion Store',
    storeEmail: 'hello@bloomg.com',
    storePhone: '+234 801 234 5678',
    storeAddress: '123 Fashion Street, Lagos, Nigeria',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    storeDescription: 'Premium fashion wear for the modern individual',
    
    // Payment
    paystackPublicKey: '',
    paystackSecretKey: '',
    paystackTestMode: true,
    paymentMethods: {
      card: true,
      bankTransfer: true,
      cashOnDelivery: true
    },
    
    // Notifications
    emailNotifications: true,
    newOrderEmail: 'admin@bloomg.com',
    lowStockThreshold: 10,
    notifyOnLowStock: true,
    notifyOnNewOrder: true,
    notifyOnOrderUpdate: true,
    
    // Appearance
    primaryColor: '#7C3AED',
    secondaryColor: '#F59E0B',
    logoUrl: '',
    faviconUrl: '',
    theme: 'light',
    
    // Shipping
    shippingEnabled: true,
    shippingFee: 1500,
    freeShippingThreshold: 10000,
    shippingZones: [
      {
        id: '1',
        name: 'Lagos',
        countries: ['Nigeria'],
        rate: 1000
      },
      {
        id: '2',
        name: 'Other Nigerian States',
        countries: ['Nigeria'],
        rate: 2000
      }
    ]
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: 'success' | 'error', text: '' })
  const [uploading, setUploading] = useState(false)
  const [isEditingZone, setIsEditingZone] = useState<string | null>(null)
  const [newZone, setNewZone] = useState({ name: '', countries: [''], rate: 0 })

  // Load settings from backend on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Apply theme when settings change
  useEffect(() => {
    if (settings.theme && settings.theme !== theme) {
      setTheme(settings.theme)
    }
  }, [settings.theme, theme, setTheme])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('bloomg_admin_settings')
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: 'success', text: '' })
    
    try {
      // Save to backend
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('bloomg_admin_settings', JSON.stringify(settings))
        
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        
        // Apply theme immediately
        if (settings.theme && settings.theme !== theme) {
          setTheme(settings.theme)
        }
        
        // Apply currency to entire app (you could use a context/store)
        document.documentElement.style.setProperty('--currency', settings.currency)
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: 'success', text: '' }), 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    if (!file) return
    
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (type === 'logo') {
          setSettings(prev => ({ ...prev, logoUrl: data.url }))
        } else {
          setSettings(prev => ({ ...prev, faviconUrl: data.url }))
        }
        
        setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!` })
        setTimeout(() => setMessage({ type: 'success', text: '' }), 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to upload ${type}` })
    } finally {
      setUploading(false)
    }
  }

  const handleAddZone = () => {
    if (!newZone.name || newZone.rate <= 0) return
    
    const zoneId = Date.now().toString()
    const updatedZones = [
      ...settings.shippingZones,
      { ...newZone, id: zoneId, countries: newZone.countries.filter(c => c.trim()) }
    ]
    
    setSettings(prev => ({ ...prev, shippingZones: updatedZones }))
    setNewZone({ name: '', countries: [''], rate: 0 })
  }

  const handleEditZone = (zoneId: string) => {
    const zone = settings.shippingZones.find(z => z.id === zoneId)
    if (zone) {
      setIsEditingZone(zoneId)
      setNewZone({ ...zone, countries: [...zone.countries] })
    }
  }

  const handleUpdateZone = () => {
    if (!isEditingZone || !newZone.name || newZone.rate <= 0) return
    
    const updatedZones = settings.shippingZones.map(zone => 
      zone.id === isEditingZone 
        ? { ...newZone, id: isEditingZone, countries: newZone.countries.filter(c => c.trim()) }
        : zone
    )
    
    setSettings(prev => ({ ...prev, shippingZones: updatedZones }))
    setNewZone({ name: '', countries: [''], rate: 0 })
    setIsEditingZone(null)
  }

  const handleDeleteZone = (zoneId: string) => {
    if (confirm('Are you sure you want to delete this shipping zone?')) {
      const updatedZones = settings.shippingZones.filter(zone => zone.id !== zoneId)
      setSettings(prev => ({ ...prev, shippingZones: updatedZones }))
    }
  }

  const handleAddCountry = () => {
    setNewZone(prev => ({ ...prev, countries: [...prev.countries, ''] }))
  }

  const handleCountryChange = (index: number, value: string) => {
    const newCountries = [...newZone.countries]
    newCountries[index] = value
    setNewZone(prev => ({ ...prev, countries: newCountries }))
  }

  const handleRemoveCountry = (index: number) => {
    const newCountries = newZone.countries.filter((_, i) => i !== index)
    setNewZone(prev => ({ ...prev, countries: newCountries }))
  }

  const categories = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'shipping', label: 'Shipping', icon: Truck }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Store Name *
          </label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
            placeholder="Your store name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Store Email *
          </label>
          <input
            type="email"
            value={settings.storeEmail}
            onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
            placeholder="contact@store.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Store Phone
          </label>
          <input
            type="tel"
            value={settings.storePhone}
            onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
            placeholder="+234 800 000 0000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="NGN">Nigerian Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
            <option value="GHS">Ghanaian Cedi (₵)</option>
            <option value="KES">Kenyan Shilling (KSh)</option>
            <option value="ZAR">South African Rand (R)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="Africa/Lagos">Lagos, Nigeria (GMT+1)</option>
            <option value="Africa/Accra">Accra, Ghana (GMT+0)</option>
            <option value="Africa/Nairobi">Nairobi, Kenya (GMT+3)</option>
            <option value="Africa/Johannesburg">Johannesburg, South Africa (GMT+2)</option>
            <option value="UTC">UTC (GMT+0)</option>
            <option value="America/New_York">New York, USA (GMT-5)</option>
            <option value="Europe/London">London, UK (GMT+0)</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Store Address
          </label>
          <textarea
            value={settings.storeAddress}
            onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
            placeholder="Full store address"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Store Description
          </label>
          <textarea
            value={settings.storeDescription}
            onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
            placeholder="Describe your store for SEO and customer information"
          />
        </div>
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Payment Security</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Your payment keys are stored securely. Never share these keys publicly.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paystack Public Key
          </label>
          <input
            type="password"
            value={settings.paystackPublicKey}
            onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
            placeholder="pk_live_..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get this from your Paystack dashboard</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paystack Secret Key
          </label>
          <input
            type="password"
            value={settings.paystackSecretKey}
            onChange={(e) => setSettings({ ...settings, paystackSecretKey: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
            placeholder="sk_live_..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Keep this secret and never share it</p>
        </div>
        
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="paystackTestMode"
              checked={settings.paystackTestMode}
              onChange={(e) => setSettings({ ...settings, paystackTestMode: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="paystackTestMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable Test Mode
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use test mode for development. Transactions won't be charged.
          </p>
        </div>
      </div>
      
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credit/Debit Cards</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visa, Mastercard, Verve</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.paymentMethods.card}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentMethods: { ...settings.paymentMethods, card: e.target.checked }
                })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Transfer</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Direct bank payments</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.paymentMethods.bankTransfer}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentMethods: { ...settings.paymentMethods, bankTransfer: e.target.checked }
                })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cash on Delivery</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive the order</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.paymentMethods.cashOnDelivery}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentMethods: { ...settings.paymentMethods, cashOnDelivery: e.target.checked }
                })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Notifications</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure email alerts and notifications</p>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Email Notifications
          </label>
        </div>
      </div>
      
      {settings.emailNotifications && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Email Address
            </label>
            <input
              type="email"
              value={settings.newOrderEmail}
              onChange={(e) => setSettings({ ...settings, newOrderEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
              placeholder="notifications@store.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All order and stock notifications will be sent to this email
            </p>
          </div>
          
          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Orders</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when a new order is placed</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewOrder}
                    onChange={(e) => setSettings({ ...settings, notifyOnNewOrder: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Updates</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notifications when order status changes</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnOrderUpdate}
                    onChange={(e) => setSettings({ ...settings, notifyOnOrderUpdate: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Alerts</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get alerted when products are running low</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnLowStock}
                    onChange={(e) => setSettings({ ...settings, notifyOnLowStock: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stock Management</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Low Stock Threshold
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                  className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
                  min="1"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">items</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Receive alerts when product stock falls below this number
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="w-12 h-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
              placeholder="#7C3AED"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Main brand color for buttons and highlights</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
              className="w-12 h-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
              placeholder="#F59E0B"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accent color for secondary elements</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme Mode
          </label>
          <select
            value={settings.theme}
            onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'auto' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="auto">Auto (System Preference)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin panel appearance</p>
        </div>
      </div>
      
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Brand Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              {settings.logoUrl ? (
                <div className="relative">
                  <img
                    src={settings.logoUrl}
                    alt="Store Logo"
                    className="h-32 mx-auto object-contain"
                  />
                  <button
                    onClick={() => setSettings({ ...settings, logoUrl: '' })}
                    className="absolute top-0 right-0 p-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload your store logo</p>
                  <label className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'logo')
                      }}
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Recommended: 200×200px PNG or SVG</p>
                </>
              )}
              {uploading && (
                <div className="mt-2 text-sm text-gray-500">Uploading...</div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Favicon
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              {settings.faviconUrl ? (
                <div className="relative">
                  <img
                    src={settings.faviconUrl}
                    alt="Favicon"
                    className="h-16 w-16 mx-auto object-contain"
                  />
                  <button
                    onClick={() => setSettings({ ...settings, faviconUrl: '' })}
                    className="absolute top-0 right-0 p-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Eye className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload your favicon</p>
                  <label className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'favicon')
                      }}
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Recommended: 32×32px ICO or PNG</p>
                </>
              )}
              {uploading && (
                <div className="mt-2 text-sm text-gray-500">Uploading...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipping</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure shipping options and rates</p>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="shippingEnabled"
            checked={settings.shippingEnabled}
            onChange={(e) => setSettings({ ...settings, shippingEnabled: e.target.checked })}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="shippingEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Shipping
          </label>
        </div>
      </div>
      
      {settings.shippingEnabled && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standard Shipping Fee ({settings.currency === 'NGN' ? '₦' : settings.currency === 'USD' ? '$' : '€'})
              </label>
              <input
                type="number"
                value={settings.shippingFee}
                onChange={(e) => setSettings({ ...settings, shippingFee: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
                min="0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Standard delivery charge</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Free Shipping Threshold ({settings.currency === 'NGN' ? '₦' : settings.currency === 'USD' ? '$' : '€'})
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
                min="0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Free shipping for orders above this amount (0 to disable)
              </p>
            </div>
          </div>
          
          <div className="border-t dark:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipping Zones</h3>
              <button 
                onClick={() => setIsEditingZone(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Zone
              </button>
            </div>
            
            {/* Add/Edit Zone Form */}
            {(isEditingZone !== null || settings.shippingZones.length === 0) && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {isEditingZone ? 'Edit Shipping Zone' : 'Add New Shipping Zone'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zone Name *
                    </label>
                    <input
                      type="text"
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Lagos, International"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Shipping Rate ({settings.currency === 'NGN' ? '₦' : settings.currency === 'USD' ? '$' : '€'}) *
                    </label>
                    <input
                      type="number"
                      value={newZone.rate}
                      onChange={(e) => setNewZone({ ...newZone, rate: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Countries *
                      </label>
                      <button
                        type="button"
                        onClick={handleAddCountry}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700"
                      >
                        + Add Country
                      </button>
                    </div>
                    {newZone.countries.map((country, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => handleCountryChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Nigeria"
                        />
                        {newZone.countries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCountry(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setIsEditingZone(null)
                      setNewZone({ name: '', countries: [''], rate: 0 })
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isEditingZone ? handleUpdateZone : handleAddZone}
                    disabled={!newZone.name || !newZone.countries[0] || newZone.rate <= 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditingZone ? 'Update Zone' : 'Add Zone'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Zones Table */}
            {settings.shippingZones.length > 0 && (
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Zone Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Countries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Rate ({settings.currency === 'NGN' ? '₦' : settings.currency === 'USD' ? '$' : '€'})
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {settings.shippingZones.map((zone) => (
                      <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {zone.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {zone.countries.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {settings.currency === 'NGN' ? '₦' : settings.currency === 'USD' ? '$' : '€'}{zone.rate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button 
                            onClick={() => handleEditZone(zone.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteZone(zone.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'general':
        return renderGeneralSettings()
      case 'payment':
        return renderPaymentSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'shipping':
        return renderShippingSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure your store preferences and settings</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-64 border-r border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Settings
                </h2>
                <nav className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id as SettingsCategory)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeCategory === category.id
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {category.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {categories.find(c => c.id === activeCategory)?.label}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Configure your store's {activeCategory} settings
                  </p>
                </div>

                {renderCategoryContent()}
              </div>
            </div>
          </div>
          
          {/* Footer with Save Button */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}