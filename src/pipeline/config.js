const {
  DOTA2_DIR_VPK_PATH = '/path/to/dota2/pak01_dir.vpk',
  PORT = 3000,
  VRF_DECOMPILER_PATH = '/path/to/vrf/Decompiler',
  VRF_EXTRACT_PATH = './extract/',
} = process.env;

export default {
  DOTA2_DIR_VPK_PATH,
  PORT,
  VRF_EXTRACT_PATH,
  VRF_DECOMPILER_PATH,
};
