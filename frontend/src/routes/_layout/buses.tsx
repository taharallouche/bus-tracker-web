import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState } from "react"

import { BusesService, ItemsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "@/components/Items/columns"
import PendingItems from "@/components/Pending/PendingItems"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute("/_layout/buses")({
  component: ItemsByBus,
})



function getBusListQueryOptions() {
  return {
    queryKey: ["buses"],
    queryFn: () => BusesService.readBuses(),
  }
}

// --- Query Options depending on bus name ---
function getItemsByBusQueryOptions(busName: string) {
  return {
    queryKey: ["items-by-bus", busName],
    queryFn: () => ItemsService.readItemsByBus({ busName: busName, skip: 0, limit: 20 }),
    enabled: busName.length > 0, // prevents running before user searches
  }
}



// --- Table that loads based on busName prop ---
function ItemsTableContent({ busName }: { busName: string }) {
  const { data: items } = useSuspenseQuery(
    getItemsByBusQueryOptions(busName)
  )

  if (items.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">
          No items found for this bus line
        </h3>
      </div>
    )
  }

  return <DataTable columns={columns} data={items.data} />
}

// --- Suspense wrapper ---
function ItemsTable({ busName }: { busName: string }) {
  if (!busName) {
    return (
      <div className="text-muted-foreground py-6 italic">
        Select a bus line to search
      </div>
    )
  }

  return (
    <Suspense fallback={<PendingItems />}>
      <ItemsTableContent busName={busName} />
    </Suspense>
  )
}



function BusSelector({
  selectedBus,
  onSelect,
}: {
  selectedBus: string
  onSelect: (bus: string) => void
}) {
  const { data: buses } = useSuspenseQuery(getBusListQueryOptions())

  return (
    <Select value={selectedBus} onValueChange={onSelect}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select a bus..." />
      </SelectTrigger>

      <SelectContent>
        {buses.map((bus) => (
          <SelectItem key={bus} value={bus}>
            {bus}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// --- Top-level component with search input ---
function ItemsByBus() {
  const [selectedBus, setSelectedBus] = useState("")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bus Search</h1>
          <p className="text-muted-foreground">
            Search items by bus line
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Suspense fallback={<p>Loading buses...</p>}>
        <BusSelector selectedBus={selectedBus} onSelect={setSelectedBus} />
      </Suspense>

      {/* Results */}
      <ItemsTable busName={selectedBus} />
    </div>
  )
}
