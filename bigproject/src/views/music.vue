/*
 * @Author: 刘鲍 
 * @Date: 2019-09-06 16:34:16 
 * @Last Modified by: 刘鲍
 * @Last Modified time: 2019-09-07 15:42:08
 */

<template>
  <el-container class="wrap">
    <el-aside width="200px">Aside</el-aside>
    <el-container>
      <el-header>
        <span>欢迎:{{username}}</span>
        <el-button type="primary" size="mini" @click="exit">退出</el-button>
      </el-header>
      <el-main>
        <el-button @click="open">添加</el-button>
        <el-table :data="musicList" style="width: 100%">
          <el-table-column label="序号" type="index"></el-table-column>
          <el-table-column label="歌名" prop="music_name"></el-table-column>
          <el-table-column label="图片">
            <template slot-scope="scope">
              <img :src="scope.row.pic" class="m-img" />
            </template>
          </el-table-column>
          <el-table-column label="歌手" prop="singer_name"></el-table-column>
          <el-table-column label="是否上架">
            <template slot-scope="scope">
              <span>{{scope.row.isup ? '是':'否'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="right">
            <template slot-scope="scope">
              <el-button size="mini" @click="edit(scope.row.id)">修改</el-button>
              <el-button size="mini" type="danger" @click="del(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="limit"
          @current-change="pageChange"
        >{{total}}</el-pagination>
        </div>
        <!-- 这是要写添加的弹窗 -->
        <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
          <el-form :model="music" ref="ruleForm" label-width="100px" class="demo-ruleForm m-form">
            <el-form-item label="歌名" prop="music_name">
              <el-input type="text" v-model="music.music_name"></el-input>
            </el-form-item>
            <el-form-item label="歌手" prop="singer_name">
              <el-input type="text" autocomplete="off" v-model="music.singer_name"></el-input>
            </el-form-item>
            <el-form-item label="上传图片" prop="pass">
              <input type="file" @change="upload" ref="file" />
              <img :src="music.pic" alt class="m-img" />
            </el-form-item>
            <el-form-item label="是否上架" prop="pass">
              <el-radio-group v-model="music.isup">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="operate">
                <span>{{editId?'修改':'添加'}}</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      musicList: [],
      dialogVisible: false,
      music: {
        music_name: "",
        singer_name: "",
        pic: "",
        isup: 1
      },
      limit: 3,//每一页展示几条数据
      pagenum:3,
      total: 0,
      editId:""
    };
  },
  created() {
    this.$api.user.getInfo().then(res => {
      if (res.data.code === 1) {
        this.setName(res.data.data.username);
      }
    });
    this.getMusicList();
  },
  methods: {
    ...mapMutations(["setName"]),
    getMusicList() {
      this.$api.music
        .querymusic({ pagenum: this.pagenum, limit: this.limit })
        .then(res => {
          if (res.data.code === 1) {
            this.musicList = res.data.data;
            this.total = res.data.total;
          }
        });
    },
    pageChange(val) {
    
      this.pagenum = val;
      this.getMusicList();
    },
    open() {
      this.reset();
      this.dialogVisible = true;
      if (this.$refs.file && this.$refs.file.files.length) {
        this.$refs.file.value = "";
      }
    },
    operate() {
      console.log(this.editId)
      if (this.editId) {
        this.editMusic();
      } else {
        this.addMusic();
      }
      
    },
    upload(e) {
      let file = e.target.files[0];
      let formdata = new FormData();
      formdata.append("file", file);
      this.$api.music.upload(formdata).then(res => {
        console.log(res);
        if (res.data.code === 1) {
          this.music.pic = "http://localhost:3000" + res.data.url;
        }
      });
    },
    editMusic() {
      this.$api.music
        .update(Object.assign({}, this.music, { id: this.editId }))
        .then(res => {
          if (res.data.code === 1) {
            this.dialogVisible = false;
            this.getMusicList();
          }
        });
    },
    exit() {
      this.$confirm("确定退出吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        localStorage.removeItem("token");
        this.$router.push("/login");
      });
    },
    addMusic() {
      this.$api.music.add(this.music).then(res => {
        if (res.data.code === 1) {
          this.dialogVisible = false;
          this.$message({
            message: "添加成功",
            type: "success"
          });
          this.getMusicList();
        }
      });
    },
    del(id) {
      this.$api.music.del({ id }).then(res => {
        if (res.data.code === 1) {
          this.$message({
            message: "删除成功",
            type: "success"
          });

          this.musicList.length <= 1 && this.pagenum > 1
            ? --this.pagenum
            : this.pagenum;
          this.getMusicList();
        }
      });
    },
    reset() {
      this.music.music_name = "";
      this.music.singer_name = "";
      this.music.pic = "";
      this.music.isup = "1";
      this.editId = "";
    },
    edit(id) {
      this.dialogVisible = true;
      this.editId = id;
      let editObj = this.musicList.find(item => item.id === id);
      this.music.music_name = editObj.music_name;
      this.music.singer_name = editObj.singer_name;
      this.music.isup = editObj.isup;
      this.music.pic = editObj.pic;
    }
  },
  computed: {
    ...mapState({
      username: state => state.user.username
    })
  }
};
</script>

<style>
.wrap {
  width: 100%;
  height: 100%;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  text-align: right;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 160px;
}

.m-img {
  width: 80px;
  height: 80px;
}

/* body > .el-container {
    margin-bottom: 40px;
  } */
/*   
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  } */
</style>