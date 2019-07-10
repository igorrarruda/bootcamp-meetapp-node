import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (req.userId === meetup.user_id) {
      return res
        .status(401)
        .json({ error: 'You can not subscribe for a yourself meetup' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't subscribe to past meetups" });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const user = await User.findByPk(req.userId);

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });
    return res.json(subscription);
  }
}

export default new SubscriptionController();
