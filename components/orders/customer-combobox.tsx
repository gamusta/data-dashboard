'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Customer } from '@prisma/client'

interface CustomerComboboxProps {
  value: string
  onValueChange: (value: string) => void
}

export function CustomerCombobox({ value, onValueChange }: CustomerComboboxProps) {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')

  const selectedCustomer = customers.find((customer) => customer.id === value)

  const fetchCustomers = async (searchQuery: string = '') => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        pageSize: '50'
      })
      
      const response = await fetch(`/api/customers?${params}`)
      if (!response.ok) throw new Error('Failed to fetch customers')
      
      const data = await response.json()
      setCustomers(data.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCustomers()
    }
  }, [open])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.length > 0) {
      fetchCustomers(searchQuery)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {selectedCustomer
            ? selectedCustomer.name
            : "Select customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search customers..." 
            value={query}
            onValueChange={handleSearch}
          />
          <CommandEmpty>
            {isLoading ? "Loading..." : "No customers found."}
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            <CommandItem
              value=""
              onSelect={() => {
                onValueChange('')
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "" ? "opacity-100" : "opacity-0"
                )}
              />
              All customers
            </CommandItem>
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={customer.id}
                onSelect={() => {
                  onValueChange(customer.id === value ? "" : customer.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === customer.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <div className="font-medium">{customer.name}</div>
                  {customer.company && (
                    <div className="text-sm text-muted-foreground">
                      {customer.company}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}