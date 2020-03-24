<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索与添加区域 -->
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户 -->
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userlist" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 编辑用户 -->
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              size="mini"
            ></el-button>
            <!-- 删除用户 -->
            <el-button
              type="danger"
              @click="deleteUser(scope.row.id)"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top-start">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
      <el-form
        :model="addUserForm"
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        :model="editUserForm"
        :rules="editUserFormRules"
        ref="editUserFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      @close="setRoleDialogClosed"
      width="50%"
    >
      <div>
        <p>当前的用户:{{ userInfo.username }}</p>
        <p>当前的角色:{{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectRoleId" placeholder="请选择新角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <div slot="footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义邮箱校验规则
    var checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if (regEail.test(value)) {
        //合法
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 自定义手机号校验规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      // 总页数
      total: 0,
      // 对话框显示与隐藏
      dialogVisible: false,
      //控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户的表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      setRoleDialogVisible: false,
      // 添加表单的验证规则对象
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            require: true,
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            require: true,
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //查询到的用户信息对象
      editUserForm: {},
      //修改表单的验证规则对象
      editUserFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      userInfo: '',
      rolesList: [],
      selectRoleId: ''
    }
  },
  methods: {
    async getUserList() {
      const { data } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (data.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }
      this.userlist = data.data.users
      this.total = data.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态
    async userStateChanged(userinfo) {
      const { data } = await this.$http.put(
        `/users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (data.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 点击按钮 添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        // 发送添加用户网络请求
        const { data } = await this.$http.post('users', this.addUserForm)
        if (data.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        this.dialogVisible = false
        this.getUserList()
      })
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      const { data } = await this.$http.get(`users/${id}`)
      if (data.meta.status !== 200) {
        this.$message.error('查询用户失败！')
      }
      this.editUserForm = data.data
      this.editDialogVisible = true
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editUserFormRef.resetFields()
    },
    //修改用户信息提交
    editUser() {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return
        //发起修改用户信息数据请求
        const { data } = await this.$http.put(`users/${this.editUserForm.id}`, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (data.meta.status !== 200) {
          this.$message.error('修改用户信息失败！')
        }
        //提示修改成功
        this.$message.success('修改成功！')
        //关闭对话框
        this.editDialogVisible = false
        //刷新数据列表
        this.getUserList()
      })
    },
    //根据id删除对应的用户信息
    deleteUser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data } = await this.$http.delete(`users/${id}`)
          if (data.meta.status !== 200) {
            this.$message.error(data.meta.msg)
          } else {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getUserList()
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    async setRole(userInfo) {
      const { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.rolesList = data.data
      this.userInfo = userInfo
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRoleId
      })
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.$message.success('分配角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      ;(this.selectRoleId = ''), (this.userInfo = {})
    }
  },
  created() {
    this.getUserList()
  }
}
</script>
