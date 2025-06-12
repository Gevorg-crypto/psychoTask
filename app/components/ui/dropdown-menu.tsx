import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Button } from '@/components/ui/button'
interface DropdownMenuProps {
  title: string;
  children: React.ReactNode;
}

export function DropdownMenu({ title, children }: DropdownMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
        {title}
      </MenuButton>
      <MenuItems
      transition
      className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {children}
      </MenuItems>
    </Menu>
  )
}