"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, User, Plus } from "lucide-react";
import { toast } from "sonner";

interface User {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
}

interface Course {
    id: string;
    title: string;
    price: number;
    isPublished: boolean;
}

const AddCoursesPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddingCourse, setIsAddingCourse] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchCourses();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users");
            if (response.ok) {
                const data = await response.json();
                // Filter only students
                const studentUsers = data.filter((user: User) => user.role === "USER");
                setUsers(studentUsers);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/courses");
            if (response.ok) {
                const data = await response.json();
                // Filter only published courses
                const publishedCourses = data.filter((course: Course) => course.isPublished);
                setCourses(publishedCourses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleAddCourse = async () => {
        if (!selectedUser || !selectedCourse) {
            toast.error("يرجى اختيار الطالب والدورة");
            return;
        }

        setIsAddingCourse(true);
        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}/add-course`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ courseId: selectedCourse }),
            });

            if (response.ok) {
                toast.success("تم إضافة الدورة للطالب بنجاح");
                setIsDialogOpen(false);
                setSelectedUser(null);
                setSelectedCourse("");
            } else {
                const error = await response.json();
                toast.error(error.message || "حدث خطأ أثناء إضافة الدورة");
            }
        } catch (error) {
            console.error("Error adding course:", error);
            toast.error("حدث خطأ أثناء إضافة الدورة");
        } finally {
            setIsAddingCourse(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    إضافة الدورات للطلاب
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة الطلاب</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="البحث بالاسم أو رقم الهاتف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">الاسم</TableHead>
                                <TableHead className="text-right">رقم الهاتف</TableHead>
                                <TableHead className="text-right">الدور</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.fullName}
                                    </TableCell>
                                    <TableCell>{user.phoneNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            طالب
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    إضافة دورة
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        إضافة دورة لـ {selectedUser?.fullName}
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">اختر الدورة</label>
                                                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="اختر دورة..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {courses.map((course) => (
                                                                    <SelectItem key={course.id} value={course.id}>
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <span>{course.title}</span>
                                                                            <Badge variant="outline" className="mr-2">
                                                                                {course.price} جنيه
                                                                            </Badge>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsDialogOpen(false);
                                                                setSelectedCourse("");
                                                                setSelectedUser(null);
                                                            }}
                                                        >
                                                            إلغاء
                                                        </Button>
                                                        <Button 
                                                            onClick={handleAddCourse}
                                                            disabled={!selectedCourse || isAddingCourse}
                                                        >
                                                            {isAddingCourse ? "جاري الإضافة..." : "إضافة الدورة"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddCoursesPage; 