"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import useAppStore from "@/lib/store/useAppStore";
import axiosInstance from "@/lib/axios-instance";
import { Skeleton } from "@/components/ui/skeleton";

interface SideBarFiltersProps {
    servicesSlug?: string;
    locationSlug?: string;
  }
function LoadingSkeleton() {
    return (
        <Card className="col-span-1 h-fit animate-pulse">
            <CardHeader className="space-y-4">
                <Skeleton className="h-8"></Skeleton>
                <Separator />
            </CardHeader>
            <CardContent className="space-y-6">
                {[1, 2].map((section) => (
                    <div key={section} className="space-y-4">
                        <Skeleton className="h-6 w-24"></Skeleton>
                        <div className="space-y-2">
                            {[1, 2, 3].map((item) => (
                                <Skeleton key={item} className="h-4"></Skeleton>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

const SideBarFilters = ({servicesSlug,locationSlug}:SideBarFiltersProps) => {
    const { services, cities: locations, serviceLoading, citiesLoading, setAgencies } = useAppStore();
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredServices, setFilteredServices] = useState(services);
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [filtersApplied, setFiltersApplied] = useState(false);

    useEffect(() => {
        const servicesParam = (servicesSlug || searchParams.get('services'))?.split(' ').filter(Boolean) || [];
        const locationsParam = (locationSlug || searchParams.get('location'))?.split(' ').filter(Boolean) || [];
        setSelectedServices(servicesParam);
        setSelectedLocations(locationsParam);
        
        // Set filtersApplied to true if there are any initial filters from the URL
        if (servicesParam.length > 0 || locationsParam.length > 0) {
            setFiltersApplied(true);
        }
    }, [servicesSlug, locationSlug, searchParams]);

    useEffect(() => {
        const filtered = services.filter(service => 
            service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredServices(filtered);

        const filteredLocs = locations.filter(location =>
            location.cityName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredLocations(filteredLocs);
    }, [searchQuery, services, locations]);

    const clearFilters = async () => {
        setSelectedServices([]);
        setSelectedLocations([]);
        setSearchQuery("");
        setFiltersApplied(false);
        router.push(pathname);
        const response = await axiosInstance.get('/agency');
        setAgencies(response.data);
    };

    const handleApplyFilters = async () => {
        const params = new URLSearchParams();
        if (selectedServices.length > 0) {
            params.set('services', selectedServices.join(' '));
        }
        if (selectedLocations.length > 0) {
            params.set('location', selectedLocations.join(' '));
        }
        
        setFiltersApplied(true);
        router.replace(`/agency?${params.toString()}`);
        const response = await axiosInstance.get(`/agency?${params.toString()}`);
        setAgencies(response.data);
    };

    const removeServiceAndApply = async (serviceSlug: string) => {
        const newServices = selectedServices.filter(s => s !== serviceSlug);
        setSelectedServices(newServices);
        
        const params = new URLSearchParams();
        if (newServices.length > 0) {
            params.set('services', newServices.join(' '));
        }
        if (selectedLocations.length > 0) {
            params.set('location', selectedLocations.join(' '));
        }
        
        if (newServices.length === 0 && selectedLocations.length === 0) {
            setFiltersApplied(false);
        }
        
        router.replace(`/agency?${params.toString()}`);
        const response = await axiosInstance.get(`/agency?${params.toString()}`);
        setAgencies(response.data);
    };

    const removeLocationAndApply = async (locationSlug: string) => {
        const newLocations = selectedLocations.filter(l => l !== locationSlug);
        setSelectedLocations(newLocations);
        
        const params = new URLSearchParams();
        if (selectedServices.length > 0) {
            params.set('services', selectedServices.join(' '));
        }
        if (newLocations.length > 0) {
            params.set('location', newLocations.join(' '));
        }
        
        if (newLocations.length === 0 && selectedServices.length === 0) {
            setFiltersApplied(false);
        }
        
        router.replace(`/agency?${params.toString()}`);
        const response = await axiosInstance.get(`/agency?${params.toString()}`);
        setAgencies(response.data);
    };

    const hasActiveFilters = () => {
        return selectedServices.length > 0 || selectedLocations.length > 0 || searchQuery.length > 0;
    };

    if (serviceLoading || citiesLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <Card className="col-span-1 h-fit">
            <CardHeader className="space-y-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-semibold">Filter</CardTitle>
                    <Button
                        onClick={handleApplyFilters}
                        size="sm"
                        className="h-8"
                    >
                        Apply Filters
                    </Button>
                </div>

                <Input
                    placeholder="Search filters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />

                {filtersApplied && (selectedServices.length > 0 || selectedLocations.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {selectedServices.map((serviceSlug) => {
                            const service = services.find(s => s.slug === serviceSlug);
                            return (
                                <div
                                    key={serviceSlug}
                                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                                >
                                    {service?.serviceName}
                                    <button
                                        onClick={() => removeServiceAndApply(serviceSlug)}
                                        className="hover:bg-blue-200 rounded-full p-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        })}
                        {selectedLocations.map((locSlug) => {
                            const location = locations.find(l => l.citySlug === locSlug);
                            return (
                                <div
                                    key={locSlug}
                                    className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm"
                                >
                                    {location?.cityName}
                                    <button
                                        onClick={() => removeLocationAndApply(locSlug)}
                                        className="hover:bg-green-200 rounded-full p-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                <Separator />
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Services</Label>
                    <ScrollArea className="h-[200px] rounded-md">
                        <div className="grid grid-cols-1 gap-2 p-1">
                            {filteredServices.map((service) => (
                                <div key={service.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={service.slug}
                                        checked={selectedServices.includes(service.slug)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedServices([...selectedServices, service.slug]);
                                            } else {
                                                setSelectedServices(selectedServices.filter(s => s !== service.slug));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={service.slug} className="text-sm font-medium">
                                        {service.serviceName}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <Separator />

                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Locations</Label>
                    <ScrollArea className="h-[200px] rounded-md">
                        <div className="grid grid-cols-1 gap-2 p-1">
                            {filteredLocations.map((location) => (
                                <div key={location.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={location.citySlug}
                                        checked={selectedLocations.includes(location.citySlug)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedLocations([...selectedLocations, location.citySlug]);
                                            } else {
                                                setSelectedLocations(selectedLocations.filter(l => l !== location.citySlug));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={location.citySlug} className="text-sm font-medium">
                                        {location.cityName}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <Separator />

                {hasActiveFilters() && (
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={clearFilters}
                    >
                        <span className="mr-2">Clear all filters</span>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default SideBarFilters;
