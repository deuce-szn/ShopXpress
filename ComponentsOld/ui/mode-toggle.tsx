'use client'

import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/ComponentsOld/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ComponentsOld/ui/dropdown-menu'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onClick={() => setTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onClick={() => setTheme('dark')}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          onClick={() => setTheme('system')}
        >
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
