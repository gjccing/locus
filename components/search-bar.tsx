import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { SearchIcon } from "@primer/octicons-react"
import { SyncIcon } from "@primer/octicons-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import _debounce from "lodash/debounce"

export function SearchBar({
  className,
  value,
  onChange,
  results = 0,
  loading = false,
}: Readonly<{
  className?: string
  value?: string
  onChange?: (value: string) => void
  results?: number
  loading?: boolean
}>) {
  const handleChange = useMemo(
    () =>
      _debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value)
      }, 500),
    [onChange]
  )

  return (
    <InputGroup className={cn("h-auto w-full px-1 py-1", className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        name="search"
        placeholder="Search repositories..."
        defaultValue={value}
        onChange={handleChange}
      />
      <InputGroupAddon align="inline-end">
        {loading && <SyncIcon className="animate-spin direction-[reverse]" />}
        {!loading && value && `${results} results`}
      </InputGroupAddon>
    </InputGroup>
  )
}
