'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarDateRangePicker } from '@/components/ui/calendar-date-range-picker'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Search, X, Filter } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { CustomerCombobox } from './customer-combobox'

interface OrdersFiltersProps {
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
}

const ORDER_STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

const CURRENCIES = [
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' }
]

export function OrdersFilters({ filters, onFiltersChange }: OrdersFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filters.q || '')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filters.status ? (Array.isArray(filters.status) ? filters.status : filters.status.split(',')) : []
  )
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    to: filters.dateTo ? new Date(filters.dateTo) : undefined,
  })
  const [selectedCustomerId, setSelectedCustomerId] = useState(filters.customerId || '')
  const [amountMin, setAmountMin] = useState(filters.amountMin?.toString() || '')
  const [amountMax, setAmountMax] = useState(filters.amountMax?.toString() || '')
  const [selectedCurrency, setSelectedCurrency] = useState(filters.currency || '')

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedAmountMin = useDebounce(amountMin, 500)
  const debouncedAmountMax = useDebounce(amountMax, 500)

  // Update search query when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery !== filters.q) {
      onFiltersChange({ q: debouncedSearchQuery })
    }
  }, [debouncedSearchQuery, filters.q, onFiltersChange])

  // Update amount filters when debounced values change
  useEffect(() => {
    const newFilters: Record<string, any> = {}
    
    if (debouncedAmountMin !== filters.amountMin?.toString()) {
      newFilters.amountMin = debouncedAmountMin ? parseFloat(debouncedAmountMin) : undefined
    }
    
    if (debouncedAmountMax !== filters.amountMax?.toString()) {
      newFilters.amountMax = debouncedAmountMax ? parseFloat(debouncedAmountMax) : undefined
    }

    if (Object.keys(newFilters).length > 0) {
      onFiltersChange(newFilters)
    }
  }, [debouncedAmountMin, debouncedAmountMax, filters.amountMin, filters.amountMax, onFiltersChange])

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter(s => s !== status)
    
    setSelectedStatuses(newStatuses)
    onFiltersChange({ status: newStatuses })
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    setDateRange(range || {})
    onFiltersChange({
      dateFrom: range?.from ? range.from.toISOString().split('T')[0] : undefined,
      dateTo: range?.to ? range.to.toISOString().split('T')[0] : undefined,
    })
  }

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId)
    onFiltersChange({ customerId: customerId || undefined })
  }

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    onFiltersChange({ currency: currency || undefined })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
    if (selectedStatuses.length > 0) count++
    if (dateRange.from || dateRange.to) count++
    if (selectedCustomerId) count++
    if (amountMin) count++
    if (amountMax) count++
    if (selectedCurrency) count++
    return count
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedStatuses([])
    setDateRange({})
    setSelectedCustomerId('')
    setAmountMin('')
    setAmountMax('')
    setSelectedCurrency('')
    onFiltersChange({
      q: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      customerId: undefined,
      amountMin: undefined,
      amountMax: undefined,
      currency: undefined,
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by order number, customer name, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Collapsible Filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </CollapsibleTrigger>
          {getActiveFiltersCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50/50">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="space-y-2">
                {ORDER_STATUSES.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={status.value}
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status.value, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={status.value} 
                      className="text-sm cursor-pointer"
                    >
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <CalendarDateRangePicker
                date={dateRange}
                onDateChange={handleDateRangeChange}
              />
            </div>

            {/* Customer Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Customer</Label>
              <CustomerCombobox
                value={selectedCustomerId}
                onValueChange={handleCustomerChange}
              />
            </div>

            {/* Amount Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount Range</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Min"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  className="w-full"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Currency Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Currency</Label>
              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All currencies</SelectItem>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <button
                onClick={() => {
                  setSearchQuery('')
                  onFiltersChange({ q: undefined })
                }}
                className="ml-1 hover:bg-gray-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              Status: {status}
              <button
                onClick={() => handleStatusChange(status, false)}
                className="ml-1 hover:bg-gray-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {(dateRange.from || dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
              <button
                onClick={() => handleDateRangeChange(undefined)}
                className="ml-1 hover:bg-gray-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}