import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

const pages = [
  { id: 1, name: "首页", path: "/", status: "已发布", updateTime: "2026-04-01 10:30" },
  { id: 2, name: "关于我们", path: "/about", status: "已发布", updateTime: "2026-03-28 15:20" },
  { id: 3, name: "产品介绍", path: "/products", status: "草稿", updateTime: "2026-04-02 09:15" },
  { id: 4, name: "联系我们", path: "/contact", status: "已发布", updateTime: "2026-03-25 14:45" },
  { id: 5, name: "新闻动态", path: "/news", status: "已发布", updateTime: "2026-04-03 08:20" },
];

export function PageConfig() {
  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">页面配置</h2>
        <p className="text-gray-600">管理网站页面的配置和布局</p>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索页面..."
                className="pl-9 w-64"
              />
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            新建页面
          </Button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>页面名称</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.name}</TableCell>
                <TableCell className="text-gray-600">{page.path}</TableCell>
                <TableCell>
                  <Badge
                    variant={page.status === "已发布" ? "default" : "secondary"}
                  >
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{page.updateTime}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
