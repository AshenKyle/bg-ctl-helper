import { TRYOUT_MEMBER } from '../../roleNames'

/**
 * TODO
 */
export default saveHandler => member => {
  if (member.roles.find("name", TRYOUT_MEMBER) !== null) {
    saveHandler.connect(member.user.id, saveHandler.tryouts.remove)
  }
}