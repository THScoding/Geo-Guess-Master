import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  useListLocations, 
  useGetLocationStats, 
  useCreateLocation, 
  useUpdateLocation, 
  useDeleteLocation,
  useGetLocation,
  getListLocationsQueryKey,
  getGetLocationStatsQueryKey,
  getGetLocationQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, Plus, Trash2, Edit2, RefreshCw, ChevronLeft, Map as MapIcon, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminMap from "@/components/admin-map";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL"),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  hint: z.string().optional()
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading: statsLoading } = useGetLocationStats();
  const { data: locations, isLoading: locationsLoading } = useListLocations();
  
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: singleLocation } = useGetLocation(editingId as number, {
    query: {
      enabled: !!editingId,
      queryKey: getGetLocationQueryKey(editingId as number)
    }
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      lat: 0,
      lng: 0,
      hint: ""
    }
  });

  const onSubmit = (data: LocationFormValues) => {
    if (editingId) {
      updateLocation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
          toast({ title: "Location updated successfully" });
          handleCloseDialog();
        },
        onError: () => toast({ title: "Failed to update location", variant: "destructive" })
      });
    } else {
      createLocation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetLocationStatsQueryKey() });
          toast({ title: "Location created successfully" });
          handleCloseDialog();
        },
        onError: () => toast({ title: "Failed to create location", variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    
    deleteLocation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLocationStatsQueryKey() });
        toast({ title: "Location deleted" });
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" })
    });
  };

  const handleEdit = (location: any) => {
    setEditingId(location.id);
    form.reset({
      name: location.name,
      description: location.description || "",
      imageUrl: location.imageUrl,
      lat: location.lat,
      lng: location.lng,
      hint: location.hint || ""
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset({
      name: "",
      description: "",
      imageUrl: "",
      lat: 0,
      lng: 0,
      hint: ""
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 md:p-6 border-b border-border bg-card flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="icon" className="mr-2">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <ShieldAlert className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
            Directorate <span className="text-primary">Control</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-lg flex flex-col items-center text-center shadow-md">
            <MapIcon className="w-8 h-8 text-primary mb-4" />
            <span className="text-4xl font-display font-bold">{statsLoading ? "-" : stats?.totalLocations}</span>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Target Locations</span>
          </div>
          <div className="bg-card border border-border p-6 rounded-lg flex flex-col items-center text-center shadow-md">
            <RefreshCw className="w-8 h-8 text-secondary mb-4" />
            <span className="text-4xl font-display font-bold">{statsLoading ? "-" : stats?.totalGames}</span>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Operations Run</span>
          </div>
          <div className="bg-card border border-border p-6 rounded-lg flex flex-col items-center text-center shadow-md">
            <BarChart className="w-8 h-8 text-accent mb-4" />
            <span className="text-4xl font-display font-bold">{statsLoading ? "-" : Math.round(stats?.avgScore || 0)}</span>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Avg Op Score</span>
          </div>
        </section>

        {/* Database Section */}
        <section className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
          <div className="p-6 border-b border-border flex justify-between items-center bg-sidebar">
            <h2 className="font-display font-bold uppercase tracking-widest text-lg">Location Database</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="font-mono uppercase text-xs" onClick={() => handleCloseDialog()}>
                  <Plus className="w-4 h-4 mr-2" /> Add Target
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-card border-border text-foreground">
                <DialogHeader>
                  <DialogTitle className="font-display uppercase tracking-widest text-xl">
                    {editingId ? "Edit Target Data" : "New Target Insertion"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono uppercase text-xs">Location Name</FormLabel>
                            <FormControl><Input placeholder="e.g. Eiffel Tower" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono uppercase text-xs">Image URL</FormLabel>
                            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="lat" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono uppercase text-xs">Latitude</FormLabel>
                              <FormControl><Input type="number" step="any" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lng" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono uppercase text-xs">Longitude</FormLabel>
                              <FormControl><Input type="number" step="any" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono uppercase text-xs">Description (Optional)</FormLabel>
                            <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="hint" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono uppercase text-xs">Hint (Optional)</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Map Picker */}
                      <div className="space-y-2 flex flex-col h-full">
                        <span className="font-mono uppercase text-xs font-bold text-muted-foreground">Select Coordinates via Map</span>
                        <div className="flex-1 min-h-[300px]">
                          <AdminMap 
                            lat={form.watch("lat")} 
                            lng={form.watch("lng")} 
                            onChange={(lat, lng) => {
                              form.setValue("lat", Number(lat.toFixed(6)));
                              form.setValue("lng", Number(lng.toFixed(6)));
                            }} 
                          />
                        </div>
                        <p className="text-xs text-muted-foreground font-mono italic">Click on map to drop pin and auto-fill lat/lng.</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-border">
                      <Button type="button" variant="outline" onClick={handleCloseDialog} className="font-mono uppercase text-xs">Cancel</Button>
                      <Button type="submit" disabled={createLocation.isPending || updateLocation.isPending} className="font-mono uppercase text-xs">
                        {createLocation.isPending || updateLocation.isPending ? "Transmitting..." : "Save Record"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-mono uppercase text-xs">ID</TableHead>
                  <TableHead className="font-mono uppercase text-xs">Image</TableHead>
                  <TableHead className="font-mono uppercase text-xs">Name</TableHead>
                  <TableHead className="font-mono uppercase text-xs">Coords</TableHead>
                  <TableHead className="text-right font-mono uppercase text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationsLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : locations?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No locations in database.</TableCell></TableRow>
                ) : (
                  locations?.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-mono text-xs">{loc.id}</TableCell>
                      <TableCell>
                        <div className="w-16 h-10 bg-cover bg-center rounded border border-border" style={{ backgroundImage: `url(${loc.imageUrl})` }} />
                      </TableCell>
                      <TableCell className="font-medium">{loc.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(loc)}>
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
