import { Plus, Search, Edit, Trash2, Image, FileText } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const contents = [
  {
    id: 1,
    title: "春季新品发布会邀请函",
    type: "文章",
    category: "新闻",
    author: "张三",
    status: "已发布",
    views: 1250,
    createTime: "2026-04-01 14:30",
  },
  {
    id: 2,
    title: "公司年度报告2025",
    type: "文档",
    category: "公告",
    author: "李四",
    status: "已发布",
    views: 890,
    createTime: "2026-03-30 09:20",
  },
  {
    id: 3,
    title: "产品宣传图册",
    type: "媒体",
    category: "营销",
    author: "王五",
    status: "草稿",
    views: 0,
    createTime: "2026-04-02 16:45",
  },
  {
    id: 4,
    title: "用户使用指南",
    type: "文章",
    category: "帮助",
    author: "赵六",
    status: "已发布",
    views: 2340,
    createTime: "2026-03-28 11:15",
  },
  {
    id: 5,
    title: "市场分析报告Q1",
    type: "文档",
    category: "报告",
    author: "张三",
    status: "审核中",
    views: 156,
    createTime: "2026-04-03 10:00",
  },
];

export function ContentManagement() {
  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">内容管理</h2>
        <p className="text-gray-600">管理网站的文章、媒体和其他内容</p>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索内容..." className="pl-9 w-64" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="article">文章</SelectItem>
                <SelectItem value="document">文档</SelectItem>
                <SelectItem value="media">媒体</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">全部状态</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="review">审核中</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            新建内容
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">总内容数</div>
              <div className="text-2xl font-semibold">324</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">已发布</div>
              <div className="text-2xl font-semibold">256</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">草稿</div>
              <div className="text-2xl font-semibold">52</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">审核中</div>
              <div className="text-2xl font-semibold">16</div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>浏览量</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {content.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{content.type}</Badge>
                </TableCell>
                <TableCell className="text-gray-600">{content.category}</TableCell>
                <TableCell className="text-gray-600">{content.author}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      content.status === "已发布"
                        ? "default"
                        : content.status === "草稿"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {content.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {content.views.toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600">{content.createTime}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
